const express = require('express');
const mongoose = require('mongoose');
const cookiesParser = require('cookie-parser');
const cors = require('cors');
const authRoutes = require('./routes/auth/auth-routes');
const adminProductsRoutes = require('./routes/admin/products-routes'); 


mongoose.connect('mongodb+srv://my1042423:11112006%40My@cluster0.24cyuxm.mongodb.net/')

.then(() => console.log('MongoDB connected successfully'))
.catch(err => console.log('MongoDB connection error:', err));




const app = express();
const PORT = process.env.PORT || 5000;

app.use(
    cors({
        origin: 'http://localhost:5173',
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
app.use(express.json());
app.use('/api/auth', authRoutes);
app.use('/api/admin/products',adminProductsRoutes)

app.listen(PORT, ()=> console.log(`Server is running on port ${PORT}`));