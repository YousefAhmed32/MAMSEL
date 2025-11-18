const User = require('../../models/User');
const Order = require('../../models/Order');
const Address = require('../../models/Address');

/**
 * Get all users with statistics
 * GET /api/admin/users
 */
const getAllUsers = async (req, res) => {
  try {
    const { role, status, search, page = 1, limit = 50 } = req.query;
    
    let filter = {};
    
    if (role && role !== 'all') {
      filter.role = role === 'admin' ? 'admin' : 'user';
    }
    
    if (status && status !== 'all') {
      filter.status = status;
    }
    
    if (search) {
      filter.$or = [
        { userName: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } }
      ];
    }
    
    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    const users = await User.find(filter)
      .select('-password')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));
    
    // Get user statistics (orders count and total spent)
    const userIds = users.map(user => user._id.toString());
    const orders = await Order.find({ userId: { $in: userIds } });
    
    // Group orders by userId
    const userStats = {};
    orders.forEach(order => {
      const userId = order.userId;
      if (!userStats[userId]) {
        userStats[userId] = {
          totalOrders: 0,
          totalSpent: 0
        };
      }
      userStats[userId].totalOrders += 1;
      userStats[userId].totalSpent += order.total || order.totalAmount || 0;
    });
    
    // Add statistics to users
    const usersWithStats = users.map(user => {
      const userId = user._id.toString();
      const stats = userStats[userId] || { totalOrders: 0, totalSpent: 0 };
      
      return {
        ...user.toObject(),
        totalOrders: stats.totalOrders,
        totalSpent: stats.totalSpent,
        avatar: user.userName ? user.userName.substring(0, 2).toUpperCase() : 'U',
        isVerified: true, // You can add email verification later
        subscription: user.role === 'admin' ? 'admin' : 'basic' // You can add subscription field later
      };
    });
    
    const total = await User.countDocuments(filter);
    
    res.status(200).json({
      success: true,
      data: usersWithStats,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(total / parseInt(limit))
      }
    });
    
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch users',
      error: error.message
    });
  }
};

/**
 * Get user details with all orders
 * GET /api/admin/users/:id
 */
const getUserDetails = async (req, res) => {
  try {
    const { id } = req.params;
    
    const user = await User.findById(id).select('-password');
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }
    
    // Get all orders for this user
    const orders = await Order.find({ userId: id.toString() })
      .sort({ createdAt: -1 })
      .populate('items.productId');
    
    // Get all addresses for this user
    const addresses = await Address.find({ userId: id.toString() })
      .sort({ createdAt: -1 });
    
    // Calculate statistics
    const totalOrders = orders.length;
    const totalSpent = orders.reduce((sum, order) => sum + (order.total || order.totalAmount || 0), 0);
    
    // Format order images
    orders.forEach(order => {
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
          order.payment.proofImage.url = `${process.env.CORS_ORIGIN_IMAGE}${order.payment.proofImage.url.startsWith('/') ? '' : '/'}${order.payment.proofImage.url}`;
        }
      }
    });
    
    res.status(200).json({
      success: true,
      data: {
        ...user.toObject(),
        orders,
        addresses,
        totalOrders,
        totalSpent,
        avatar: user.userName ? user.userName.substring(0, 2).toUpperCase() : 'U'
      }
    });
    
  } catch (error) {
    console.error('Error fetching user details:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch user details',
      error: error.message
    });
  }
};

/**
 * Update user status (activate/deactivate)
 * PUT /api/admin/users/:id/status
 */
const updateUserStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    
    if (!['active', 'inactive'].includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid status. Must be "active" or "inactive"'
      });
    }
    
    const user = await User.findById(id);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }
    
    // Prevent deactivating admin accounts
    if (user.role === 'admin' && status === 'inactive') {
      return res.status(400).json({
        success: false,
        message: 'Cannot deactivate admin accounts'
      });
    }
    
    user.status = status;
    await user.save();
    
    res.status(200).json({
      success: true,
      message: `User ${status === 'active' ? 'activated' : 'deactivated'} successfully`,
      data: user
    });
    
  } catch (error) {
    console.error('Error updating user status:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update user status',
      error: error.message
    });
  }
};

/**
 * Get users statistics
 * GET /api/admin/users/stats/summary
 */
const getUsersStats = async (req, res) => {
  try {
    const { timeframe = '30d' } = req.query;
    
    const now = new Date();
    let startDate;
    
    switch (timeframe) {
      case '1h':
        startDate = new Date(now.getTime() - 60 * 60 * 1000);
        break;
      case '7d':
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case '30d':
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        break;
      default:
        startDate = new Date(0); // All time
    }
    
    // Total users
    const totalUsers = await User.countDocuments({});
    
    // Active users
    const activeUsers = await User.countDocuments({ status: 'active' });
    
    // New users in timeframe
    const newUsers = await User.countDocuments({
      createdAt: { $gte: startDate }
    });
    
    // Users active in last hour (based on lastLogin)
    const lastHourActive = await User.countDocuments({
      lastLogin: { $gte: new Date(now.getTime() - 60 * 60 * 1000) }
    });
    
    // Get all orders for revenue calculation
    const orders = await Order.find({});
    const totalRevenue = orders.reduce((sum, order) => sum + (order.total || order.totalAmount || 0), 0);
    
    // Calculate average order value
    const ordersWithAmount = orders.filter(order => (order.total || order.totalAmount || 0) > 0);
    const avgOrderValue = ordersWithAmount.length > 0
      ? totalRevenue / ordersWithAmount.length
      : 0;
    
    // Premium users (you can customize this based on your subscription logic)
    const premiumUsers = await User.countDocuments({ role: 'admin' }); // Placeholder
    
    // Verified users (all users are considered verified for now)
    const verifiedUsers = totalUsers;
    
    res.status(200).json({
      success: true,
      data: {
        totalUsers,
        activeUsers,
        inactiveUsers: totalUsers - activeUsers,
        newUsers,
        lastHourActive,
        totalRevenue,
        avgOrderValue,
        premiumUsers,
        verifiedUsers
      }
    });
    
  } catch (error) {
    console.error('Error fetching users stats:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch users statistics',
      error: error.message
    });
  }
};

module.exports = {
  getAllUsers,
  getUserDetails,
  updateUserStatus,
  getUsersStats
};

