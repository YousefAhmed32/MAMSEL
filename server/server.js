        require('dotenv').config()

        const express = require('express');
        const mongoose = require('mongoose');
        const cookiesParser = require('cookie-parser');
        const cors = require('cors');

        const authRoutes = require('./routes/auth/auth-routes');
        const adminProductsRoutes = require('./routes/admin/products-routes'); 
        const adminOrderRoutes = require('./routes/admin/order-routes'); 
        const adminAnalysisRoutes = require('./routes/admin/analysis-routes');
        const adminCouponRoutes = require('./routes/admin/coupon-routes');
        const adminBrandRoutes = require('./routes/admin/brand-routes');



        const shopProductsRouter =require('./routes/shop/products-routes')
        const shopCartRouter = require('./routes/shop/cart-routes');
        const shopAddressRouter= require('./routes/shop/Address')
        const shopOrderRouter= require('./routes/shop/order-routers')
        const shopSearchRouter= require('./routes/shop/search-routes')
        const shopReviewRouter= require('./routes/shop/review-routes')
        
        // New checkout and sample routes
        const shopCheckoutRouter = require('./routes/shop/checkout-routes');
        const shopSampleRouter = require('./routes/shop/samples-routes');
        const shopCouponRouter = require('./routes/shop/coupon-routes');

        const commonFeatureRouter= require('./routes/common/feature-routes')
        
        // Admin routes
        const adminOrdersRouter = require('./routes/admin/admin-orders-routes');
        const adminSamplesRouter = require('./routes/admin/admin-samples-routes');
        const adminUsersRouter = require('./routes/admin/users-routes');


        //         mongoose.connect('mongodb+srv://my1042423:11112006%40My@cluster0.24cyuxm.mongodb.net/')
        //.then(() => console.log('MongoDB connected successfully'))
        //.catch(err => console.log('MongoDB connection error:', err));


        
        // Connect to MongoDB using environment variable
        const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/ecommerce';
        
        mongoose.connect(MONGODB_URI)
        .then(() => console.log('✅ MongoDB connected successfully'))
        .catch(err => {
            console.error('❌ MongoDB connection error:', err);
            process.exit(1);
        });




        const app = express();
        const PORT = process.env.PORT || 5000;
        
        // Socket.io setup for real-time notifications
        const http = require('http');
        const server = http.createServer(app);
        const { Server } = require('socket.io');
        const io = new Server(server, {
            cors: {
                origin: process.env.CORS_ORIGIN || 'http://localhost:5173',
                methods: ['GET', 'POST'],
                credentials: true
            }
        });
        
        // Store io instance in app for use in controllers
        app.set('io', io);
        
        // Socket.io connection handling
        io.on('connection', (socket) => {
            console.log('✅ Client connected:', socket.id);
            
            // Handle admin authentication and room joining
            socket.on('joinAdminRoom', (data) => {
                // Verify admin token if needed
                // For now, allow joining admin room
                socket.join('admin');
                console.log(`👤 Admin joined room: ${socket.id}`);
            });
            
            // Handle user authentication and room joining
            socket.on('joinUserRoom', (userId) => {
                socket.join(`user_${userId}`);
                console.log(`👤 User ${userId} joined room: ${socket.id}`);
            });
            
            socket.on('disconnect', () => {
                console.log('❌ Client disconnected:', socket.id);
            });
        });

        // CORS configuration from environment variable
        const CORS_ORIGIN = process.env.CORS_ORIGIN || 'http://localhost:5173';
        
        app.use(
            cors({
                origin: CORS_ORIGIN,
                methods: ['GET', 'POST','PUT', 'DELETE'],
                allowedHeaders: [
                    "Content-type",
                    "Authorization",
                    "Cache-Control",
                    "expires",
                    "Pragma",
                ],
                credentials: true

            })
        )
        app.use(cookiesParser());
        app.use(express.json({ limit: '50mb' }));
        app.use(express.urlencoded({ limit: '50mb', extended: true }));
        
        // Serve uploaded files statically
        const path = require('path');
        app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
        
        // Ensure upload directories exist
        const fs = require('fs');
        const uploadsDirs = [
            path.join(__dirname, 'uploads/products'),
            path.join(__dirname, 'uploads/order-proofs')
        ];
        uploadsDirs.forEach(dir => {
            if (!fs.existsSync(dir)) {
                fs.mkdirSync(dir, { recursive: true });
            }
        });
        
        app.use('/api/auth', authRoutes);
        app.use('/api/admin/products',adminProductsRoutes)
        app.use('/api/admin/orders',adminOrderRoutes)
        app.use('/api/admin/analysis',adminAnalysisRoutes)
        app.use("/api/admin/coupons", adminCouponRoutes);
        app.use('/api/admin', adminBrandRoutes);
        
        // New admin routes
        app.use('/api/admin/orders-new', adminOrdersRouter);
        app.use('/api/admin/samples', adminSamplesRouter);
        app.use('/api/admin/users', adminUsersRouter);




        app.use('/api/shop/products',shopProductsRouter)
        app.use('/api/shop/cart',shopCartRouter)
        app.use('/api/shop/address', shopAddressRouter)
        app.use('/api/shop/order', shopOrderRouter)
        app.use('/api/shop/search', shopSearchRouter)
        app.use('/api/shop/review', shopReviewRouter)
        
        // New shop routes
        app.use('/api/checkout', shopCheckoutRouter);
        app.use('/api/samples', shopSampleRouter);
        app.use('/api/coupons', shopCouponRouter);
        
        // New orders routes
        const shopOrdersRouter = require('./routes/shop/orders-routes');
        const userOrdersRouter = require('./routes/shop/user-orders-routes');
        app.use('/api/orders', shopOrdersRouter);
        app.use('/api/users', userOrdersRouter);
        
        // Order details route (legacy compatibility)
        // app.use('/api/orders', shopCheckoutRouter); // Commented out - using new route above

        app.use('/api/common/feature', commonFeatureRouter) 

        // Health check endpoint
        app.get('/health', (req, res) => {
            console.log('Server is running');
            res.status(200).send('Server is running');
    });

        server.listen(PORT, ()=> {
            console.log(`🚀 Server is running on port ${PORT}`);
            console.log(`📁 Local file storage: ${path.join(__dirname, 'uploads/products')}`);
            console.log(`🌐 CORS Origin: ${CORS_ORIGIN}`);
            console.log(`🔌 Socket.io ready for real-time notifications`);
        });