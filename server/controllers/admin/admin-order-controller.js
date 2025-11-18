const Order = require('../../models/Order');
const fs = require('fs');
const path = require('path');

/**
 * Get all orders with filtering
 * GET /api/admin/orders
 */
const getAllOrders = async (req, res) => {
  try {
    const { status, paymentStatus, page = 1, limit = 50 } = req.query;
    
    let filter = {};
    
    if (status) {
      filter.orderStatus = status;
    }
    
    if (paymentStatus) {
      filter['payment.status'] = paymentStatus;
    }
    
    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    const orders = await Order.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit))
      .populate('items.productId');
    
    const total = await Order.countDocuments(filter);
    
    // Format payment proof URLs, transfer images, and product images
    orders.forEach(order => {
      // Format product images
      if (order.items && order.items.length > 0) {
        order.items.forEach(item => {
          if (item.productImage && !item.productImage.startsWith('http')) {
            item.productImage = `${process.env.CORS_ORIGIN_IMAGE}${item.productImage.startsWith('/') ? '' : '/'}${item.productImage}`;
          }
        });
      }
      
      // Format payment proof URLs
      if (order.payment && order.payment.proofImage && order.payment.proofImage.url) {
        if (!order.payment.proofImage.url.startsWith('http')) {
          order.payment.proofImage.url = `${process.env.CORS_ORIGIN_IMAGE}${order.payment.proofImage.url}`;
        }
      }
      
      // Format transfer images
      if (order.payment && order.payment.transferInfo && order.payment.transferInfo.image && order.payment.transferInfo.image.url) {
        if (!order.payment.transferInfo.image.url.startsWith('http')) {
          order.payment.transferInfo.image.url = `${process.env.CORS_ORIGIN_IMAGE}${order.payment.transferInfo.image.url}`;
        }
      }
    });
    
    res.status(200).json({
      success: true,
      data: orders,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(total / parseInt(limit))
      }
    });
    
  } catch (error) {
    console.error('Error fetching orders:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch orders',
      error: error.message
    });
  }
};

/**
 * Approve order payment
 * PUT /api/admin/orders/:id/approve
 */
const approveOrder = async (req, res) => {
  try {
    const { id } = req.params;
    const { adminNote } = req.body;
    const adminUserId = req.userId || 'admin';
    
    const order = await Order.findById(id);
    
    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }
    
    // Update payment status and order status
    order.payment.status = 'approved';
    order.payment.approvedAt = new Date();
    order.payment.approvedBy = adminUserId;
    if (adminNote) {
      order.payment.adminNote = adminNote;
    }
    
    order.orderStatus = 'processing';
    
    await order.save();
    
    res.status(200).json({
      success: true,
      message: 'Order approved successfully',
      data: order
    });
    
  } catch (error) {
    console.error('Error approving order:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to approve order',
      error: error.message
    });
  }
};

/**
 * Reject order payment
 * PUT /api/admin/orders/:id/reject
 */
const rejectOrder = async (req, res) => {
  try {
    const { id } = req.params;
    const { adminNote } = req.body;
    const adminUserId = req.user?.id || req.userId || 'admin';
    
    if (!adminNote) {
      return res.status(400).json({
        success: false,
        message: 'Admin note is required for rejection'
      });
    }
    
    const order = await Order.findById(id);
    
    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }
    
    // Update payment status and order status
    order.payment.status = 'rejected';
    order.payment.adminNote = adminNote;
    order.orderStatus = 'cancelled';
    
    await order.save();
    
    res.status(200).json({
      success: true,
      message: 'Order rejected successfully',
      data: order
    });
    
  } catch (error) {
    console.error('Error rejecting order:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to reject order',
      error: error.message
    });
  }
};

/**
 * Update order status
 * PUT /api/admin/orders/:id/status
 */
const updateOrderStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { orderStatus, adminNote } = req.body;
    
    const validStatuses = ['pending', 'accepted', 'rejected', 'on the way', 'processing', 'shipped', 'delivered', 'cancelled'];
    
    if (!validStatuses.includes(orderStatus)) {
      return res.status(400).json({
        success: false,
        message: `Invalid order status. Must be one of: ${validStatuses.join(', ')}`
      });
    }
    
    const order = await Order.findById(id);
    
    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }
    
    order.orderStatus = orderStatus;
    
    // Update payment status based on order status
    // For COD orders: when order is delivered, payment should be automatically approved
    if (orderStatus === 'delivered') {
      // If payment method is COD, automatically approve payment when delivered
      if (order.payment?.method === 'COD' || order.paymentMethod === 'COD') {
        order.payment.status = 'approved';
        order.payment.approvedAt = new Date();
        order.payment.approvedBy = req.user?.id || req.userId || 'admin';
      }
      // For other payment methods, if not already approved/rejected, approve on delivery
      else if (order.payment?.status === 'pending' || order.payment?.status === 'awaiting_admin_approval') {
        order.payment.status = 'approved';
        order.payment.approvedAt = new Date();
        order.payment.approvedBy = req.user?.id || req.userId || 'admin';
      }
    } else if (orderStatus === 'accepted') {
      order.payment.status = 'approved';
      order.payment.approvedAt = new Date();
      order.payment.approvedBy = req.user?.id || req.userId || 'admin';
    } else if (orderStatus === 'rejected' || orderStatus === 'cancelled') {
      // Only reject payment if it's not already approved
      if (order.payment?.status !== 'approved') {
        order.payment.status = 'rejected';
      }
    }
    
    if (adminNote) {
      order.payment.adminNote = adminNote;
    }
    
    await order.save();
    
    res.status(200).json({
      success: true,
      message: 'Order status updated successfully',
      data: order
    });
    
  } catch (error) {
    console.error('Error updating order status:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update order status',
      error: error.message
    });
  }
};

/**
 * Get order details for admin
 * GET /api/admin/orders/:id
 */
const getOrderDetails = async (req, res) => {
  try {
    const { id } = req.params;
    
    const order = await Order.findById(id)
      .populate('items.productId');
    
    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }
    
    // Format product images
    if (order.items && order.items.length > 0) {
      order.items.forEach(item => {
        if (item.productImage && !item.productImage.startsWith('http')) {
          item.productImage = `${process.env.CORS_ORIGIN_IMAGE}${item.productImage.startsWith('/') ? '' : '/'}${item.productImage}`;
        }
      });
    }
    
    // Format payment proof URL and transfer image
    if (order.payment && order.payment.proofImage && order.payment.proofImage.url) {
      if (!order.payment.proofImage.url.startsWith('http')) {
        order.payment.proofImage.url = `${process.env.CORS_ORIGIN_IMAGE}${order.payment.proofImage.url}`;
      }
    }
    if (order.payment && order.payment.transferInfo && order.payment.transferInfo.image && order.payment.transferInfo.image.url) {
      if (!order.payment.transferInfo.image.url.startsWith('http')) {
        order.payment.transferInfo.image.url = `${process.env.CORS_ORIGIN_IMAGE}${order.payment.transferInfo.image.url}`;
      }
    }
    
    res.status(200).json({
      success: true,
      data: order
    });
    
  } catch (error) {
    console.error('Error fetching order details:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch order details',
      error: error.message
    });
  }
};

module.exports = {
  getAllOrders,
  approveOrder,
  rejectOrder,
  updateOrderStatus,
  getOrderDetails
};

