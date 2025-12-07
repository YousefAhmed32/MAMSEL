const Product = require('../../models/Product');
const Brand = require('../../models/Brand');
const mongoose = require('mongoose');

const getFilterProducts = async (req, res) => {
  try {
    const { 
      category = [], 
      brands = [], 
      minPrice, 
      maxPrice,
      sortBy = 'price-lowtohigh',
      keyword,
      groups // Filter by collections/groups (can be multiple comma-separated)
    } = req.query;
    
    let filters = { isActive: true }; // Only show active products

    // Groups/Collections filter - support multiple groups
    if (groups && groups.trim().length > 0) {
      const groupList = groups.split(',').map(g => g.trim()).filter(g => g.length > 0);
      if (groupList.length > 0) {
        filters.groups = { $in: groupList };
      }
    }

    // Category filter (apply before keyword search to avoid duplicate category matching)
    if (category && category.length > 0) {
      filters.category = { $in: category.split(',') };
    }

    // Search keyword filter - search in title, description, brand, and groups
    if (keyword && keyword.trim().length > 0) {
      const searchRegex = new RegExp(keyword.trim(), 'i');
      
      // Search for brands matching the keyword
      const matchingBrands = await Brand.find({
        $or: [
          { name: searchRegex },
          { nameEn: searchRegex }
        ],
        isActive: true
      }).select('_id');
      
      const brandIds = matchingBrands.map(brand => brand._id);
      
      // Create search filter for products
      // Search in title, description, and groups
      const searchConditions = [
        { title: searchRegex },
        { description: searchRegex },
        { groups: searchRegex } // Search in groups array - MongoDB will match if any element matches
      ];
      
      // If brands found, add them to the search
      if (brandIds.length > 0) {
        searchConditions.push({ brand: { $in: brandIds } });
      }
      
      // Only add category to search if no category filter is applied
      if (!category || category.length === 0) {
        searchConditions.push({ category: searchRegex });
      }
      
      filters.$or = searchConditions;
    }

    // Brand filter - convert brand names/IDs to ObjectIds
    if (brands && brands.length > 0) {
      const brandList = brands.split(',');
      const brandIdPromises = brandList.map(async (brandIdentifier) => {
        // Check if it's a valid ObjectId
        if (mongoose.Types.ObjectId.isValid(brandIdentifier)) {
          return new mongoose.Types.ObjectId(brandIdentifier);
        } else {
          // Try to find by nameEn
          const brand = await Brand.findOne({ 
            nameEn: { $regex: new RegExp(`^${brandIdentifier}$`, 'i') },
            isActive: true 
          });
          return brand ? brand._id : null;
        }
      });
      
      const brandIds = (await Promise.all(brandIdPromises)).filter(id => id !== null);
      
      if (brandIds.length > 0) {
        filters.brand = { $in: brandIds };
      }
    }

    // Price range filter
    if (minPrice || maxPrice) {
      filters.price = {};
      if (minPrice) {
        filters.price.$gte = parseFloat(minPrice);
      }
      if (maxPrice) {
        filters.price.$lte = parseFloat(maxPrice);
      }
    }

    let sort = {};

    switch (sortBy) {
      case 'price-lowtohigh':
        sort.price = 1;
        break;
      case 'price-hightolow':
        sort.price = -1;
        break;
      case 'title-atoz':
        sort.title = 1;
        break;
      case 'title-ztoa':
        sort.title = -1;
        break;
      default:
        sort.price = 1;
        break;
    }

    console.log('Filters:', filters);
    console.log('Sort:', sort);

    const products = await Product.find(filters).populate('brand', 'name nameEn').sort(sort);

    res.status(200).json({
      success: true,
      data: products,
    });
  } catch (e) {
    console.log(e);
    res.status(500).json({
      success: false,
      message: 'Some error occurred',
    });
  }
};

// Get all unique brands from products
const getBrands = async (req, res) => {
  try {
    // Get all active brands that have products
    const brands = await Brand.find({ isActive: true })
      .sort({ nameEn: 1 })
      .select('_id name nameEn');
    
    res.status(200).json({
      success: true,
      data: brands,
    });
  } catch (e) {
    console.log(e);
    res.status(500).json({
      success: false,
      message: 'Some error occurred while fetching brands',
    });
  }
};

// Get min and max prices from products
const getPriceRange = async (req, res) => {
  try {
    const minPriceDoc = await Product.findOne({ isActive: true })
      .sort({ price: 1 })
      .select('price')
      .limit(1);
    
    const maxPriceDoc = await Product.findOne({ isActive: true })
      .sort({ price: -1 })
      .select('price')
      .limit(1);
    
    const minPrice = minPriceDoc ? minPriceDoc.price : 0;
    const maxPrice = maxPriceDoc ? maxPriceDoc.price : 1000;
    
    res.status(200).json({
      success: true,
      data: {
        minPrice,
        maxPrice,
      },
    });
  } catch (e) {
    console.log(e);
    res.status(500).json({
      success: false,
      message: 'Some error occurred while fetching price range',
    });
  }
};

const getProductDetails =async (req,res)=>{
  try {
    const {id} =req.params
    const product =await Product.findById(id).populate('brand', 'name nameEn')
    if(!product) return res.status(404).json({
      success :false,
      message :'Product not found !!'
    })
    res.status(200).json({
      success :true,
      data :product,
    })
  } catch (e) {
    console.log(e);
    res.status(500).json({
      success: false,
      message: 'Some error occurred',
    });
  }
}




// Get all unique groups/collections from active products
const getGroups = async (req, res) => {
  try {
    // Get all distinct groups from active products using aggregation
    // This is more efficient than fetching all products
    const groupsResult = await Product.aggregate([
      { $match: { isActive: true, groups: { $exists: true, $ne: [] } } },
      { $unwind: '$groups' },
      { $group: { _id: '$groups' } },
      { $project: { _id: 0, group: '$_id' } },
      { $sort: { group: 1 } }
    ]);
    
    // Extract group names and filter out empty strings
    const uniqueGroups = groupsResult
      .map(item => item.group)
      .filter(group => group && group.trim().length > 0)
      .sort();
    
    res.status(200).json({
      success: true,
      data: uniqueGroups,
    });
  } catch (e) {
    console.log('Error fetching groups:', e);
    res.status(500).json({
      success: false,
      message: 'Some error occurred while fetching groups',
      error: e.message
    });
  }
};

// Get top sold products from last 30 days
const getTopSoldProducts = async (req, res) => {
  try {
    const last30Days = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    
    // First, try to get products from last 30 days sorted by sold
    let products = await Product.find({
      createdAt: { $gte: last30Days },
      isActive: true
    })
    .populate('brand', 'name nameEn')
    .sort({ sold: -1 })
    .limit(10);
    
    // If no products found in last 30 days, get top sold products regardless of date
    if (!products || products.length === 0) {
      console.log('No products found in last 30 days, fetching top sold products regardless of date');
      products = await Product.find({
        isActive: true
      })
      .populate('brand', 'name nameEn')
      .sort({ sold: -1, createdAt: -1 })
      .limit(10);
    }
    
    // If still no products with sold count, get latest products
    if (!products || products.length === 0) {
      console.log('No products with sold count, fetching latest products');
      products = await Product.find({
        isActive: true
      })
      .populate('brand', 'name nameEn')
      .sort({ createdAt: -1 })
      .limit(10);
    }
    
    console.log(`Found ${products.length} top sold products`);
    
    res.status(200).json({
      success: true,
      data: products,
    });
  } catch (e) {
    console.log('Error fetching top sold products:', e);
    res.status(500).json({
      success: false,
      message: 'Some error occurred while fetching top sold products',
      error: e.message
    });
  }
};

module.exports = { getFilterProducts, getProductDetails, getBrands, getPriceRange, getTopSoldProducts, getGroups };
