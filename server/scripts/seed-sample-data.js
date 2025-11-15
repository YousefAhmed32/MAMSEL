const mongoose = require('mongoose');
const User = require('../models/User');
const Product = require('../models/Product');
const Brand = require('../models/Brand');
const bcrypt = require('bcrypt');

// Connect to MongoDB
mongoose.connect('mongodb+srv://my1042423:11112006%40My@cluster0.24cyuxm.mongodb.net/')
  .then(() => console.log('MongoDB connected successfully'))
  .catch(err => console.log('MongoDB connection error:', err));

async function seedSampleData() {
  try {
    // Check if we have users
    const userCount = await User.countDocuments();
    if (userCount === 0) {
      console.log('Creating sample users...');
      const hashedPassword = await bcrypt.hash('123456', 8);
      
      const sampleUsers = [
        {
          userName: 'أحمد محمد',
          email: 'ahmed@example.com',
          password: hashedPassword,
          role: 'user'
        },
        {
          userName: 'فاطمة علي',
          email: 'fatima@example.com',
          password: hashedPassword,
          role: 'user'
        },
        {
          userName: 'محمد أحمد',
          email: 'mohammed@example.com',
          password: hashedPassword,
          role: 'user'
        },
        {
          userName: 'نورا سعد',
          email: 'nora@example.com',
          password: hashedPassword,
          role: 'user'
        }
      ];

      await User.insertMany(sampleUsers);
      console.log(`Created ${sampleUsers.length} users`);
    } else {
      console.log(`Found ${userCount} existing users`);
    }

    // Check if we have brands
    const brandCount = await Brand.countDocuments();
    if (brandCount === 0) {
      console.log('Creating sample brands...');
      const sampleBrands = [
        {
          name: "شانيل",
          nameEn: "Chanel",
          description: "علامة فرنسية فاخرة للعطور والجمال",
          isActive: true
        },
        {
          name: "ديور",
          nameEn: "Dior",
          description: "دار أزياء فرنسية فاخرة",
          isActive: true
        },
        {
          name: "فيرساتشي",
          nameEn: "Versace",
          description: "علامة إيطالية فاخرة",
          isActive: true
        }
      ];

      await Brand.insertMany(sampleBrands);
      console.log(`Created ${sampleBrands.length} brands`);
    } else {
      console.log(`Found ${brandCount} existing brands`);
    }

    // Check if we have products
    const productCount = await Product.countDocuments();
    if (productCount === 0) {
      console.log('Creating sample products...');
      const brands = await Brand.find();
      
      if (brands.length === 0) {
        console.log('No brands found. Please create brands first.');
        return;
      }

      const sampleProducts = [
        {
          title: "عود شانيل رقم 5",
          description: "عود نسائي فاخر برائحة زهرية كلاسيكية",
          category: "perfumes",
          brand: brands[0]._id,
          price: 450,
          salePrice: 400,
          totalStock: 50,
          size: "100ml",
          fragranceType: "floral",
          gender: "women",
          images: ["https://via.placeholder.com/300x300"],
          isActive: true
        },
        {
          title: "عود ديور سوفاج",
          description: "عود رجالي قوي برائحة خشبية",
          category: "perfumes",
          brand: brands[1]._id,
          price: 600,
          salePrice: 550,
          totalStock: 30,
          size: "100ml",
          fragranceType: "woody",
          gender: "men",
          images: ["https://via.placeholder.com/300x300"],
          isActive: true
        },
        {
          title: "عود فيرساتشي إيروس",
          description: "عود رجالي جذاب برائحة منعشة",
          category: "perfumes",
          brand: brands[2]._id,
          price: 350,
          totalStock: 40,
          size: "100ml",
          fragranceType: "fresh",
          gender: "men",
          images: ["https://via.placeholder.com/300x300"],
          isActive: true
        },
        {
          title: "عود شانيل كوكو مادموزيل",
          description: "عود نسائي أنيق برائحة شرقية",
          category: "perfumes",
          brand: brands[0]._id,
          price: 500,
          salePrice: 450,
          totalStock: 25,
          size: "100ml",
          fragranceType: "oriental",
          gender: "women",
          images: ["https://via.placeholder.com/300x300"],
          isActive: true
        },
        {
          title: "عود ديور جادور",
          description: "عود نسائي فاخر برائحة زهرية",
          category: "perfumes",
          brand: brands[1]._id,
          price: 700,
          totalStock: 20,
          size: "100ml",
          fragranceType: "floral",
          gender: "women",
          images: ["https://via.placeholder.com/300x300"],
          isActive: true
        }
      ];

      await Product.insertMany(sampleProducts);
      console.log(`Created ${sampleProducts.length} products`);
    } else {
      console.log(`Found ${productCount} existing products`);
    }

    console.log('Sample data seeding completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding sample data:', error);
    process.exit(1);
  }
}

seedSampleData();
