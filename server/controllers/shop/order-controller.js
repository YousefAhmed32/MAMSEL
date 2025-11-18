const paypal = require("../../helper/paypal");
const Order = require("../../models/Order");
const Cart = require("../../models/Cart");
const Product =require("../../models/Product")

const createOrder = async (req, res) => {
    try {
        const {
            userId,
            cartItems,
            addressInfo,
            orderStatus,
            paymentMethod,
            paymentStatus,
            totalAmount,
            orderDate,
            orderUpdateDate,
            paymentId,
            payerId,
            cartId
        } = req.body;

        // Calculate total from cartItems to match with totalAmount
        const calculatedTotal = cartItems.reduce((acc, item) => {
            return acc + item.price * item.quantity;
        }, 0).toFixed(2);

        const finalTotal = Math.max(0, parseFloat(totalAmount)).toFixed(2);

        // ⚠️ Check mismatch
        if (calculatedTotal !== finalTotal) {
            return res.status(400).json({
                success: false,
                message: `Mismatch in cart total (${calculatedTotal}) and totalAmount (${finalTotal})`
            });
        }

        const create_payment_json = {
            intent: 'sale',
            payer: {
                payment_method: 'paypal'
            },
            redirect_urls: {
                return_url: 'http://localhost:5173/shop/paypal-return',
                cancel_url: 'http://localhost:5173/shop/paypal-cancel'
            },
            transactions: [
                {
                    item_list: {
                        items: cartItems.map(item => ({
                            name: item.title,
                            sku: item.productId,
                            price: Number(item.price).toFixed(2),
                            currency: 'USD',
                            quantity: item.quantity
                        }))
                    },
                    amount: {
                        currency: 'USD',
                        total: finalTotal
                    },
                    description: 'Order payment with optional discount'
                }
            ]
        };

        paypal.payment.create(create_payment_json, async (error, paymentInfo) => {
            if (error) {
                console.error("PayPal error:", error.response || error);
                return res.status(500).json({
                    success: false,
                    message: 'Error while creating PayPal payment',
                    error: error.response || error
                });
            }

            try {
                const newlyCreateOrder = new Order({
                    userId,
                    cartId,
                    cartItems,
                    addressInfo,
                    orderStatus,
                    paymentMethod,
                    paymentStatus,
                    totalAmount: finalTotal,
                    orderDate,
                    orderUpdateDate,
                    paymentId,
                    payerId
                });

                await newlyCreateOrder.save();

                const approvalURL = paymentInfo.links.find(link => link.rel === 'approval_url').href;

                res.status(201).json({
                    success: true,
                    approvalURL,
                    orderId: newlyCreateOrder._id
                });
            } catch (err) {
                console.error("Order saving error:", err);
                res.status(500).json({
                    success: false,
                    message: 'Error while saving order to database'
                });
            }
        });

    } catch (e) {
        console.error("Unexpected error:", e);
        res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
};



const capturePayment = async (req, res) => {
    try {
        const { paymentId, payerId, orderId } = req.body;

        let order = await Order.findById(orderId);

        if (!order) {
            return res.status(404).json({
                success: false,
                message: 'Order cannot be found'
            });
        }

        order.paymentStatus = 'paid';
        order.orderStatus = 'confirmed';
        order.paymentId = paymentId;
        order.payerId = payerId;

        for(let item of order.cartItems){
            let product = await Product.findById(item.productId)
            if(!product){
                return res.status(404).json({
                    success:false,
                    message:`Not enough stock for this product ${product.title}`
                })
            }

            product.totalStock -= item.quantity
            await product.save()
        }

        const getCartId = order.cartId;
        await Cart.findByIdAndDelete(getCartId);

        await order.save();

        res.status(200).json({
            success: true,
            message: "Order confirmed",
            data: order
        });

    } catch (e) {
        console.log(e);
        res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
};

const getAllOrdersByUser = async (req, res) => {
    try {
        // Get userId from params (could be 'id' or 'userId' depending on route)
        const userId = req.params.userId || req.params.id;
        const requestUserId = req.user?.id || req.userId;
        
        // Debug: Log user IDs for troubleshooting
        console.log('🔍 Order access check:', {
            paramUserId: userId,
            requestUserId: requestUserId,
            userRole: req.user?.role,
            idsMatch: String(requestUserId) === String(userId)
        });
        
        // Check authorization - user can only see their own orders unless admin
        // Convert both to strings for comparison (handles ObjectId vs string)
        if (String(requestUserId) !== String(userId) && req.user?.role !== 'admin') {
            console.log('❌ Access denied:', {
                requestUserId: String(requestUserId),
                paramUserId: String(userId),
                areEqual: String(requestUserId) === String(userId)
            });
            return res.status(403).json({
                success: false,
                message: 'Access denied. You can only view your own orders.'
            });
        }
        
        // Ensure userId is a string for query (MongoDB handles both string and ObjectId)
        const queryUserId = String(userId).trim();
        
        // Try to find orders - MongoDB will match string userId correctly
        const orders = await Order.find({ userId: queryUserId })
            .sort({ createdAt: -1 })
            .populate('items.productId');
        
        console.log(`✅ Found ${orders.length} orders for user ${queryUserId}`);
        
        // If no orders found, also try with different userId formats (for debugging)
        if (orders.length === 0) {
            console.log('⚠️ No orders found. Checking alternative formats...');
            const allOrders = await Order.find({}).limit(5).select('userId');
            console.log('Sample userIds in database:', allOrders.map(o => o.userId));
        }

        // Format image URLs
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
            if (order.payment?.proofImage?.url && !order.payment.proofImage.url.startsWith('http')) {
                order.payment.proofImage.url = `${process.env.CORS_ORIGIN_IMAGE}${order.payment.proofImage.url}`;
            }
            
            // Format transfer images
            if (order.payment?.transferInfo?.image?.url && !order.payment.transferInfo.image.url.startsWith('http')) {
                order.payment.transferInfo.image.url = `${process.env.CORS_ORIGIN_IMAGE}${order.payment.transferInfo.image.url}`;
            }
        });

        res.status(200).json({
            success: true,
            data: orders
        });

    } catch (e) {
        console.log(e);
        res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
};

const getOrderDetails = async (req, res) => {
    try {
        const { id } = req.params;
        const order = await Order.findById(id);

        if (!order) {
            return res.status(404).json({
                success: false,
                message: 'Order not found!'
            });
        }

        res.status(200).json({
            success: true,
            data: order
        });

    } catch (e) {
        console.log(e);
        res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
};

module.exports = {
    createOrder,
    capturePayment,
    getAllOrdersByUser,
    getOrderDetails
};
