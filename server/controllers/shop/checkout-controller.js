const mongoose = require('mongoose');
const Order = require('../../models/Order');
const Coupon = require('../../models/Coupon');
const Product = require('../../models/Product');
const Cart = require('../../models/Cart');
const User = require('../../models/User');
const { deleteUploadedFiles } = require('../../middleware/upload');
const fs = require('fs');

/**
 * Create a new order with payment proof upload
 * POST /api/orders
 * Accepts: multipart/form-data with items, address, couponCode, paymentMethod, transferInfo (for Transfer), transferImage file
 */
const createOrder = async (req, res) => {
  let uploadedFile = null;
  
  try {
    // Debug: Log file upload info
    console.log('📁 File upload check:', {
      hasFile: !!req.file,
      fileInfo: req.file ? {
        fieldname: req.file.fieldname,
        originalname: req.file.originalname,
        filename: req.file.filename,
        mimetype: req.file.mimetype,
        size: req.file.size
      } : null
    });
    
    // Get transfer image file if uploaded (for Transfer payment method)
    if (req.file) {
      uploadedFile = req.file;
      console.log('✅ File received:', uploadedFile.filename);
    } else {
      console.log('⚠️ No file in req.file');
    }
    
    // Validate required fields
    const { items, address, couponCode, paymentMethod, transferFullName, transferAmount } = req.body;
    
    console.log('📦 Order data:', {
      paymentMethod,
      hasTransferFullName: !!transferFullName,
      hasTransferAmount: !!transferAmount,
      hasUploadedFile: !!uploadedFile
    });
    
    if (!items || !address || !paymentMethod) {
      if (uploadedFile) {
        fs.unlinkSync(uploadedFile.path);
      }
      return res.status(400).json({
        success: false,
        message: 'Missing required fields: items, address, and paymentMethod are required'
      });
    }
    
    // Validate payment method specific requirements
    if (paymentMethod === 'Transfer') {
      if (!transferFullName || !transferAmount) {
        if (uploadedFile) {
          fs.unlinkSync(uploadedFile.path);
        }
        return res.status(400).json({
          success: false,
          message: 'Transfer payment requires: fullName and amountTransferred'
        });
      }
      if (!uploadedFile) {
        return res.status(400).json({
          success: false,
          message: 'Transfer payment requires transfer image upload'
        });
      }
    }
    
    // Parse items JSON string
    let orderItems = [];
    try {
      orderItems = typeof items === 'string' ? JSON.parse(items) : items;
    } catch (e) {
      if (uploadedFile) fs.unlinkSync(uploadedFile.path);
      return res.status(400).json({
        success: false,
        message: 'Invalid items format'
      });
    }
    
    if (!Array.isArray(orderItems) || orderItems.length === 0) {
      if (uploadedFile) fs.unlinkSync(uploadedFile.path);
      return res.status(400).json({
        success: false,
        message: 'Order items array is required and cannot be empty'
      });
    }
    
    // Parse address JSON string
    let addressData = {};
    try {
      addressData = typeof address === 'string' ? JSON.parse(address) : address;
    } catch (e) {
      if (uploadedFile) fs.unlinkSync(uploadedFile.path);
      return res.status(400).json({
        success: false,
        message: 'Invalid address format'
      });
    }
    
    // Get user ID from request FIRST (should be set by auth middleware)
    const userId = String(req.user?.id || req.userId || req.body.userId || '');
    
    if (!userId || userId === 'undefined' || userId === 'null') {
      if (uploadedFile) fs.unlinkSync(uploadedFile.path);
      return res.status(401).json({
        success: false,
        message: 'User authentication required'
      });
    }
    
    // Calculate subtotal and prepare order items with product images
    let subtotal = 0;
    const orderItemsWithImages = [];
    
    for (const item of orderItems) {
      const product = await Product.findById(item.productId);
      if (!product) {
        if (uploadedFile) fs.unlinkSync(uploadedFile.path);
        return res.status(400).json({
          success: false,
          message: `Product ${item.productId} not found`
        });
      }
      const price = item.price || product.salePrice || product.price;
      subtotal += price * item.quantity;
      
      // Get product image - prefer from item, fallback to product.image
      let productImage = item.image || item.productImage || '';
      if (!productImage && product.image) {
        productImage = product.image;
      }
      
      orderItemsWithImages.push({
        ...item,
        productImage: productImage
      });
    }
    
    // Calculate shipping BEFORE coupon discount
    const shipping = subtotal >= 100 ? 0 : 10; // Free shipping over 100 QAR
    const totalBeforeDiscount = subtotal + shipping;
    
    // Handle coupon validation (after getting userId and calculating totals)
    let couponDiscount = 0;
    let usedCoupon = null;
    let couponError = null;
    
    // Validate and apply coupon if provided
    if (couponCode && couponCode.trim()) {
      try {
        const couponCodeUpper = couponCode.trim().toUpperCase();
        console.log('🔍 Looking for coupon:', couponCodeUpper);
        
        // Find coupon in database
        const coupon = await Coupon.findOne({ 
          code: couponCodeUpper
        });
        
        // Check if coupon exists
        if (!coupon) {
          couponError = 'كود الكوبون غير صحيح';
          console.log('❌ Coupon not found:', couponCodeUpper);
        } else {
          // Safely check coupon properties
          const isActive = coupon.isActive === true;
          const discountType = coupon.discountType || null;
          const amount = coupon.amount || 0;
          const expiresAt = coupon.expiresAt || null;
          
          console.log('📋 Coupon found:', {
            code: coupon.code || couponCodeUpper,
            isActive: isActive,
            discountType: discountType,
            amount: amount,
            expiresAt: expiresAt,
            usedCount: coupon.usedCount || 0,
            usageLimitGlobal: coupon.usageLimitGlobal || null
          });
          
          // Check if coupon is active
          if (!isActive) {
            couponError = 'الكوبون غير مفعّل حالياً';
            console.log('❌ Coupon is not active');
          } 
          // Check if coupon has expired
          else if (expiresAt && new Date() > new Date(expiresAt)) {
            couponError = 'الكوبون منتهي الصلاحية';
            console.log('❌ Coupon has expired');
          }
          // Check if coupon has valid discount type and amount
          else if (!discountType || (discountType !== 'fixed' && discountType !== 'percent')) {
            couponError = 'الكوبون غير صالح - نوع الخصم غير معروف';
            console.log('❌ Invalid discount type:', discountType);
          }
          else if (!amount || amount <= 0) {
            couponError = 'الكوبون غير صالح - قيمة الخصم غير صحيحة';
            console.log('❌ Invalid discount amount:', amount);
          }
          else {
            // Validate coupon with userId (ensure methods exist)
            try {
              const userIdString = String(userId);
              
              // Check if isValid method exists
              if (typeof coupon.isValid !== 'function') {
                couponError = 'خطأ في التحقق من صحة الكوبون';
                console.log('❌ isValid method not found on coupon');
              } else {
                const validation = coupon.isValid(userIdString);
                console.log('🔍 Coupon validation result:', validation);
                
                if (!validation || !validation.valid) {
                  // Translate error messages to Arabic
                  let arabicReason = validation?.reason || 'الكوبون غير صالح للاستخدام';
                  if (validation?.reason === 'You have already used this coupon') {
                    arabicReason = 'لقد استخدمت هذا الكوبون من قبل';
                  } else if (validation?.reason === 'Coupon has expired') {
                    arabicReason = 'الكوبون منتهي الصلاحية';
                  } else if (validation?.reason === 'Coupon is not active') {
                    arabicReason = 'الكوبون غير مفعّل حالياً';
                  } else if (validation?.reason === 'Coupon usage limit reached') {
                    arabicReason = 'تم الوصول إلى حد استخدام الكوبون';
                  }
                  couponError = arabicReason;
                  console.log('❌ Coupon validation failed:', validation?.reason);
                } else {
                  // Calculate discount based on subtotal (before shipping)
                  // Check if calculateDiscount method exists
                  if (typeof coupon.calculateDiscount !== 'function') {
                    couponError = 'خطأ في حساب الخصم';
                    console.log('❌ calculateDiscount method not found on coupon');
                  } else {
                    const discountCalc = coupon.calculateDiscount(subtotal);
                    console.log('💰 Discount calculation:', {
                      subtotal,
                      discountType: discountType,
                      amount: amount,
                      result: discountCalc
                    });
                    
                    if (!discountCalc || !discountCalc.valid) {
                      couponError = discountCalc?.reason || 'لا يمكن تطبيق الكوبون على هذا الطلب';
                      console.log('❌ Coupon discount calculation failed:', discountCalc?.reason);
                    } else {
                      // Successfully applied coupon
                      couponDiscount = discountCalc.discountAmount || 0;
                      usedCoupon = coupon;
                      console.log('✅ Coupon applied successfully:', {
                        code: coupon.code,
                        discount: couponDiscount,
                        subtotal: subtotal
                      });
                    }
                  }
                }
              }
            } catch (validationError) {
              console.error('❌ Error during coupon validation:', validationError);
              couponError = 'خطأ في التحقق من صحة الكوبون: ' + (validationError.message || 'خطأ غير معروف');
            }
          }
        }
      } catch (e) {
        console.error('❌ Coupon validation error:', e);
        console.error('Error stack:', e.stack);
        couponError = 'حدث خطأ أثناء التحقق من الكوبون: ' + (e.message || 'خطأ غير معروف');
      }
    }
    
    // If coupon was provided but invalid, return error with clear message
    if (couponCode && couponCode.trim() && !usedCoupon) {
      if (uploadedFile && uploadedFile.path) {
        try {
          fs.unlinkSync(uploadedFile.path);
        } catch (unlinkErr) {
          console.error('Error deleting uploaded file:', unlinkErr);
        }
      }
      return res.status(400).json({
        success: false,
        message: couponError || 'الكوبون غير صالح'
      });
    }
    
    // Calculate totals after coupon discount
    const discount = couponDiscount;
    const totalAfterDiscount = Math.max(0, totalBeforeDiscount - discount);
    
    // Prepare payment object based on payment method
    let paymentObj = {
      method: paymentMethod,
      status: 'pending' // Default for COD and Free Sample
    };
    
    // Handle Transfer payment method
    if (paymentMethod === 'Transfer') {
      if (!uploadedFile || !uploadedFile.filename) {
        if (uploadedFile && uploadedFile.path) {
          fs.unlinkSync(uploadedFile.path);
        }
        return res.status(400).json({
          success: false,
          message: 'Transfer payment requires valid transfer image upload'
        });
      }
      
      const transferImage = {
        filename: uploadedFile.filename,
        path: uploadedFile.path,
        url: `/uploads/order-proofs/${uploadedFile.filename}`,
        mimetype: uploadedFile.mimetype || 'image/jpeg',
        size: uploadedFile.size || 0
      };
      
      paymentObj.transferInfo = {
        fullName: transferFullName,
        amountTransferred: parseFloat(transferAmount),
        image: transferImage
      };
      paymentObj.status = 'awaiting_admin_approval';
      paymentObj.proofImage = transferImage; // For backward compatibility
    } else if (paymentMethod === 'Free Sample') {
      paymentObj.status = 'pending';
    } else if (paymentMethod === 'COD') {
      paymentObj.status = 'pending';
    }
    
    // Prepare coupon snapshot (safely)
    let appliedCoupon = null;
    if (usedCoupon && couponDiscount > 0) {
      try {
        const couponCodeValue = usedCoupon.code || '';
        const couponDiscountType = usedCoupon.discountType || 'percent';
        const couponAmount = usedCoupon.amount || 0;
        
        appliedCoupon = {
          code: couponCodeValue,
          type: (couponDiscountType === 'fixed') ? 'fixed' : 'percent',
          value: couponAmount,
          discountAmount: couponDiscount
        };
      } catch (couponSnapshotError) {
        console.error('❌ Error creating coupon snapshot:', couponSnapshotError);
        // Continue without coupon snapshot if there's an error
        appliedCoupon = null;
      }
    }
    
    // Create order
    const newOrder = new Order({
      userId,
      items: orderItemsWithImages.map(item => {
        // Convert productId to ObjectId if it's a valid string
        let productIdValue = item.productId;
        if (typeof productIdValue === 'string' && mongoose.Types.ObjectId.isValid(productIdValue)) {
          try {
            productIdValue = new mongoose.Types.ObjectId(productIdValue);
          } catch (e) {
            console.warn('⚠️ Failed to convert productId to ObjectId:', e.message);
          }
        }
        return {
          productId: productIdValue,
          title: item.title || '',
          price: item.price || 0,
          quantity: item.quantity || 1,
          productImage: item.productImage || item.image || ''
        };
      }),
      totalBeforeDiscount,
      subtotal,
      shipping,
      discount,
      total: totalAfterDiscount,
      totalAfterDiscount,
      address: addressData,
      payment: paymentObj,
      orderStatus: 'pending',
      ...(appliedCoupon ? { appliedCoupon } : {}), // Only include if coupon exists
      couponCode: (usedCoupon && usedCoupon.code) ? String(usedCoupon.code) : '',
      couponDiscount,
      isSampleOrder: paymentMethod === 'Free Sample'
    });
    
    // Save order
    await newOrder.save();
    
    // Clear cart after successful order creation
    try {
      const userCart = await Cart.findOne({ userId });
      if (userCart) {
        userCart.items = [];
        await userCart.save();
      }
    } catch (cartError) {
      console.error('Error clearing cart:', cartError);
      // Don't fail the order if cart clearing fails
    }
    
    // Increment coupon usage if used
    if (usedCoupon) {
      try {
        // Ensure usedByUsers array exists
        if (!usedCoupon.usedByUsers) {
          usedCoupon.usedByUsers = [];
        }
        
        usedCoupon.usedCount += 1;
        const userIdString = String(userId); // Ensure userId is a string for comparison
        const userUsageIndex = usedCoupon.usedByUsers.findIndex(u => String(u.userId) === userIdString);
        
        if (userUsageIndex >= 0) {
          usedCoupon.usedByUsers[userUsageIndex].usageCount += 1;
          usedCoupon.usedByUsers[userUsageIndex].lastUsedAt = new Date();
        } else {
          usedCoupon.usedByUsers.push({
            userId: userIdString,
            usageCount: 1,
            lastUsedAt: new Date()
          });
        }
        await usedCoupon.save();
        console.log('✅ Coupon usage updated successfully');
      } catch (couponSaveError) {
        console.error('❌ Error saving coupon usage:', couponSaveError);
        // Don't fail the order if coupon usage update fails
        // Log error but continue with order creation
      }
    }
    
    // Emit Socket.io event for new order notification to admins only
    const io = req.app.get('io');
    if (io) {
      // Get user name from database
      let userName = 'مستخدم';
      try {
        const user = await User.findById(userId);
        if (user && user.userName) {
          userName = user.userName;
        }
      } catch (userError) {
        console.error('Error fetching user name:', userError);
      }
      
      // Emit to admin room for admin users
      io.to('admin').emit('newOrder', {
        orderId: newOrder._id,
        orderNumber: newOrder._id.toString().substring(0, 8),
        userId: userId,
        userName: userName,
        total: totalAfterDiscount,
        totalBeforeDiscount: totalBeforeDiscount,
        paymentMethod: paymentMethod,
        orderStatus: newOrder.orderStatus,
        paymentStatus: newOrder.payment.status,
        itemsCount: orderItemsWithImages.length,
        createdAt: newOrder.createdAt,
        message: `طلب جديد #${newOrder._id.toString().substring(0, 8)} - ${paymentMethod} - ${totalAfterDiscount} QR`
      });
      
      // Also emit to all connections (for admin dashboard)
      io.emit('orderUpdate', {
        type: 'new',
        orderId: newOrder._id,
        orderStatus: newOrder.orderStatus
      });
      
      console.log(`📢 New order notification sent: Order #${newOrder._id.toString().substring(0, 8)} - User: ${userName}`);
    }
    
    res.status(201).json({
      success: true,
      message: paymentMethod === 'Transfer' 
        ? 'Order created successfully. Awaiting admin approval.' 
        : 'Order created successfully.',
      data: {
        orderId: newOrder._id,
        orderNumber: newOrder._id.toString(),
        total: totalAfterDiscount,
        paymentStatus: newOrder.payment.status,
        orderStatus: newOrder.orderStatus
      }
    });
    
  } catch (error) {
    console.error('❌ Error creating order:', error);
    console.error('Error stack:', error.stack);
    console.error('Error details:', {
      message: error.message,
      name: error.name,
      code: error.code
    });
    
    // Clean up uploaded file on error
    if (uploadedFile && uploadedFile.path) {
      try {
        fs.unlinkSync(uploadedFile.path);
        console.log('✅ Cleaned up uploaded file');
      } catch (unlinkError) {
        console.error('Error deleting uploaded file:', unlinkError);
      }
    }
    
    // Determine specific error message based on error type
    let errorMessage = 'فشل إنشاء الطلب';
    let statusCode = 500;
    
    if (error.name === 'ValidationError') {
      errorMessage = 'بيانات الطلب غير صحيحة: ' + (error.message || 'يرجى التحقق من البيانات المدخلة');
      statusCode = 400;
    } else if (error.name === 'CastError') {
      errorMessage = 'خطأ في نوع البيانات: ' + (error.message || 'يرجى التحقق من البيانات المدخلة');
      statusCode = 400;
    } else if (error.message && error.message.includes('coupon')) {
      errorMessage = 'خطأ في الكوبون: ' + error.message;
      statusCode = 400;
    } else if (error.message && error.message.includes('payment')) {
      errorMessage = 'خطأ في طريقة الدفع: ' + error.message;
      statusCode = 400;
    } else if (error.message && error.message.includes('product')) {
      errorMessage = 'خطأ في المنتج: ' + error.message;
      statusCode = 400;
    } else if (error.message) {
      errorMessage = error.message;
    }
    
    res.status(statusCode).json({
      success: false,
      message: errorMessage,
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
      details: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
};

/**
 * Get order details by ID
 * GET /api/orders/:id
 */
const getOrderDetails = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user?.id || req.userId || req.query.userId;
    const isAdmin = req.user?.role === 'admin' || req.isAdmin || false;
    
    const order = await Order.findById(id).populate('items.productId');
    
    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }
    
    // Check authorization (user can only see their own orders unless admin)
    if (!isAdmin && order.userId !== userId) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
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
    
    // Format payment proof URL
    if (order.payment && order.payment.proofImage && order.payment.proofImage.url) {
      const proofUrl = order.payment.proofImage.url.startsWith('http')
        ? order.payment.proofImage.url
        : `${process.env.CORS_ORIGIN_IMAGE}${order.payment.proofImage.url}`;
      order.payment.proofImage.url = proofUrl;
    }
    
    // Format transfer image URL if exists
    if (order.payment && order.payment.transferInfo && order.payment.transferInfo.image && order.payment.transferInfo.image.url) {
      const transferUrl = order.payment.transferInfo.image.url.startsWith('http')
        ? order.payment.transferInfo.image.url
        : `${process.env.CORS_ORIGIN_IMAGE}${order.payment.transferInfo.image.url}`;
      order.payment.transferInfo.image.url = transferUrl;
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
  createOrder,
  getOrderDetails
};

