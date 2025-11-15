const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const Brand = require('../../models/Brand');
// const { isAuth, isAdmin } = require('../../middleware/auth');

// Get all brands
router.get('/brands', async (req, res) => {
  try {
    const brands = await Brand.find().sort({ name: 1 });
    res.json({
      success: true,
      data: brands
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'خطأ في جلب العلامات التجارية',
      error: error.message
    });
  }
});

// Get active brands only (for product form)
router.get('/brands/active', async (req, res) => {
  try {
    const brands = await Brand.find({ isActive: true }).sort({ name: 1 });
    res.json({
      success: true,
      data: brands
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'خطأ في جلب العلامات التجارية النشطة',
      error: error.message
    });
  }
});

// Create new brand
router.post('/brands', async (req, res) => {
  try {
    const { name, nameEn, description, logo } = req.body;

    // Check if brand already exists
    const existingBrand = await Brand.findOne({ 
      $or: [
        { name: { $regex: new RegExp(`^${name}$`, 'i') } },
        { nameEn: { $regex: new RegExp(`^${nameEn}$`, 'i') } }
      ]
    });

    if (existingBrand) {
      return res.status(400).json({
        success: false,
        message: 'العلامة التجارية موجودة بالفعل'
      });
    }

    const brand = new Brand({
      name,
      nameEn,
      description,
      logo,
      isActive: true
    });

    await brand.save();

    res.status(201).json({
      success: true,
      message: 'تم إنشاء العلامة التجارية بنجاح',
      data: brand
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'خطأ في إنشاء العلامة التجارية',
      error: error.message
    });
  }
});

// Update brand
router.put('/brands/:id', async (req, res) => {
  try {
    const { name, nameEn, description, logo, isActive } = req.body;

    // Check if brand exists
    const brand = await Brand.findById(req.params.id);
    if (!brand) {
      return res.status(404).json({
        success: false,
        message: 'العلامة التجارية غير موجودة'
      });
    }

    // Check if new name conflicts with existing brands
    if (name !== brand.name || nameEn !== brand.nameEn) {
      const existingBrand = await Brand.findOne({ 
        _id: { $ne: req.params.id },
        $or: [
          { name: { $regex: new RegExp(`^${name}$`, 'i') } },
          { nameEn: { $regex: new RegExp(`^${nameEn}$`, 'i') } }
        ]
      });

      if (existingBrand) {
        return res.status(400).json({
          success: false,
          message: 'العلامة التجارية موجودة بالفعل'
        });
      }
    }

    brand.name = name;
    brand.nameEn = nameEn;
    brand.description = description;
    brand.logo = logo;
    brand.isActive = isActive !== undefined ? isActive : brand.isActive;

    await brand.save();

    res.json({
      success: true,
      message: 'تم تحديث العلامة التجارية بنجاح',
      data: brand
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'خطأ في تحديث العلامة التجارية',
      error: error.message
    });
  }
});

// Delete brand
router.delete('/brands/:id', async (req, res) => {
  try {
    const brand = await Brand.findById(req.params.id);
    if (!brand) {
      return res.status(404).json({
        success: false,
        message: 'العلامة التجارية غير موجودة'
      });
    }

    // Check if brand is used in products
    const Product = require('../../models/Product');
    const productsWithBrand = await Product.find({ brand: brand._id });
    
    if (productsWithBrand.length > 0) {
      return res.status(400).json({
        success: false,
        message: `لا يمكن حذف العلامة التجارية لأنها مستخدمة في ${productsWithBrand.length} منتج`
      });
    }

    await Brand.findByIdAndDelete(req.params.id);

    res.json({
      success: true,
      message: 'تم حذف العلامة التجارية بنجاح'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'خطأ في حذف العلامة التجارية',
      error: error.message
    });
  }
});

// Toggle brand status
router.patch('/brands/:id/toggle', async (req, res) => {
  try {
    const { id } = req.params;
    
    // Validate MongoDB ObjectId format using mongoose method
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: 'معرف العلامة التجارية غير صحيح'
      });
    }

    // Find the brand first to get current status
    const brand = await Brand.findById(id).lean();
    if (!brand) {
      return res.status(404).json({
        success: false,
        message: 'العلامة التجارية غير موجودة'
      });
    }

    // Ensure isActive has a default value if undefined
    const currentStatus = brand.isActive !== undefined && brand.isActive !== null ? brand.isActive : true;
    const newStatus = !currentStatus;
    
    // Update using updateOne to avoid validation issues
    // This directly updates the database without triggering save hooks
    const updateResult = await Brand.updateOne(
      { _id: id },
      { 
        $set: { 
          isActive: newStatus,
          updatedAt: new Date()
        } 
      }
    );

    if (updateResult.matchedCount === 0) {
      return res.status(404).json({
        success: false,
        message: 'العلامة التجارية غير موجودة'
      });
    }

    if (updateResult.modifiedCount === 0) {
      return res.status(400).json({
        success: false,
        message: 'لم يتم تحديث حالة العلامة التجارية'
      });
    }

    // Fetch the updated brand to return it
    const updatedBrand = await Brand.findById(id);

    res.json({
      success: true,
      message: `تم ${newStatus ? 'تفعيل' : 'إلغاء تفعيل'} العلامة التجارية بنجاح`,
      data: updatedBrand
    });
  } catch (error) {
    console.error('Error toggling brand status:', error);
    
    // Check if it's a cast error (invalid ID)
    if (error.name === 'CastError' || error.kind === 'ObjectId') {
      return res.status(400).json({
        success: false,
        message: 'معرف العلامة التجارية غير صحيح'
      });
    }
    
    res.status(500).json({
      success: false,
      message: 'خطأ في تغيير حالة العلامة التجارية',
      error: error.message
    });
  }
});

module.exports = router;
