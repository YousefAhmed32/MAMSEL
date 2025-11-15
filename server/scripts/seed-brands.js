const mongoose = require('mongoose');
const Brand = require('../models/Brand');

// Connect to MongoDB
mongoose.connect('mongodb+srv://my1042423:11112006%40My@cluster0.24cyuxm.mongodb.net/')
  .then(() => console.log('MongoDB connected successfully'))
  .catch(err => console.log('MongoDB connection error:', err));

const defaultBrands = [
  {
    name: "شانيل",
    nameEn: "Chanel",
    description: "علامة فرنسية فاخرة للعطور والجمال",
    logo: "",
    isActive: true
  },
  {
    name: "ديور",
    nameEn: "Dior",
    description: "دار أزياء فرنسية فاخرة",
    logo: "",
    isActive: true
  },
  {
    name: "فيرساتشي",
    nameEn: "Versace",
    description: "علامة إيطالية فاخرة",
    logo: "",
    isActive: true
  },
  {
    name: "جوتشي",
    nameEn: "Gucci",
    description: "علامة إيطالية فاخرة للأزياء و العود",
    logo: "",
    isActive: true
  },
  {
    name: "توم فورد",
    nameEn: "Tom Ford",
    description: "علامة أمريكية فاخرة للعطور",
    logo: "",
    isActive: true
  },
  {
    name: "إيف سان لوران",
    nameEn: "Yves Saint Laurent",
    description: "علامة فرنسية فاخرة",
    logo: "",
    isActive: true
  },
  {
    name: "أرماني",
    nameEn: "Armani",
    description: "علامة إيطالية فاخرة",
    logo: "",
    isActive: true
  },
  {
    name: "فيكتوريا سيكريت",
    nameEn: "Victoria's Secret",
    description: "علامة أمريكية للعطور النسائية",
    logo: "",
    isActive: true
  },
  {
    name: "هوجو بوس",
    nameEn: "Hugo Boss",
    description: "علامة ألمانية فاخرة",
    logo: "",
    isActive: true
  },
  {
    name: "كالفن كلاين",
    nameEn: "Calvin Klein",
    description: "علامة أمريكية للعطور",
    logo: "",
    isActive: true
  }
];

async function seedBrands() {
  try {
    // Clear existing brands
    await Brand.deleteMany({});
    console.log('Cleared existing brands');

    // Insert default brands
    const brands = await Brand.insertMany(defaultBrands);
    console.log(`Successfully seeded ${brands.length} brands`);

    // Display created brands
    brands.forEach(brand => {
      console.log(`- ${brand.name} (${brand.nameEn})`);
    });

    process.exit(0);
  } catch (error) {
    console.error('Error seeding brands:', error);
    process.exit(1);
  }
}

seedBrands();
