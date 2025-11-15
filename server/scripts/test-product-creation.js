const mongoose = require('mongoose');
const Product = require('../models/Product');
const Brand = require('../models/Brand');

// Connect to MongoDB
mongoose.connect('mongodb+srv://my1042423:11112006%40My@cluster0.24cyuxm.mongodb.net/')
  .then(() => console.log('MongoDB connected successfully'))
  .catch(err => console.log('MongoDB connection error:', err));

async function testProductCreation() {
  try {
    // Get a brand
    const brand = await Brand.findOne();
    if (!brand) {
      console.log('No brands found. Please create brands first.');
      return;
    }

    console.log(`Using brand: ${brand.name} (${brand.nameEn})`);

    // Create a test product
    const testProduct = new Product({
      title: "عود شانيل رقم 5 - إصدار محدود",
      description: "عود نسائي فاخر برائحة زهرية كلاسيكية مع لمسة عصرية. يتميز برائحة الياسمين والورد مع قاعدة خشبية دافئة.",
      category: "perfumes",
      brand: brand._id,
      price: 450,
      salePrice: 400,
      totalStock: 25,
      size: "100ml",
      fragranceType: "floral",
      gender: "women",
      image: "https://images.unsplash.com/photo-1541643600914-78b084683601?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80",
      images: [
        "https://images.unsplash.com/photo-1541643600914-78b084683601?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80",
        "https://images.unsplash.com/photo-1592945403244-b3fbafd7f539?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80"
      ],
      isActive: true
    });

    await testProduct.save();
    console.log('✅ Test product created successfully!');
    console.log(`Product ID: ${testProduct._id}`);
    console.log(`Product Title: ${testProduct.title}`);
    console.log(`Product Price: $${testProduct.price}`);
    console.log(`Product Brand: ${brand.name}`);

    process.exit(0);
  } catch (error) {
    console.error('❌ Error creating test product:', error);
    process.exit(1);
  }
}

testProductCreation();


