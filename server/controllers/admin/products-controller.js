const Product = require("../../models/Product");
const { deleteUploadedFiles } = require("../../middleware/upload");

/**
 * Handle single image upload (for backward compatibility)
 * Returns the file information in the same format as before
 */
const handleImageUpload = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({
                success: false,
                message: "No file uploaded"
            });
        }

        // Construct the URL for accessing the file
        const fileUrl = `/uploads/products/${req.file.filename}`;

        res.json({
            success: true,
            result: {
                url: fileUrl,
                filename: req.file.filename,
                path: req.file.path,
                mimetype: req.file.mimetype,
                size: req.file.size
            }
        });
    } catch (e) {
        console.error(e);
        res.status(500).json({
            success: false,
            message: "Image upload failed",
            error: e.message
        });
    }
};

//* --------- Add New product --------------- */
/**
 * Add a new product with image upload support
 * Accepts multipart/form-data with:
 * - images: array of image files (up to 6)
 * - Product fields: title, description, price, category, brand, etc.
 */
const addProduct = async (req, res) => {
  const uploadedFiles = [];
  
  try {
    // Get uploaded files if any
    const files = req.files || [];
    uploadedFiles.push(...files);

    // Parse form data fields
    const {
      title,
      description,
      price,
      category,
      brand,
      salePrice,
      totalStock,
      size,
      fragranceType,
      color,
      material,
      fit,
      gender,
      attributes,
      groups
    } = req.body;

    // Validate required fields
    if (!title || !description || !price || !category || !brand || !totalStock || !gender) {
      // Clean up uploaded files if validation fails
      deleteUploadedFiles(uploadedFiles);
      return res.status(400).json({
        success: false,
        message: "Missing required fields: title, description, price, category, brand, totalStock, and gender are required"
      });
    }

    // Process uploaded images
    const imageObjects = files.map(file => ({
      filename: file.filename,
      path: file.path,
      url: `/uploads/products/${file.filename}`,
      mimetype: file.mimetype,
      size: file.size
    }));

    // Set main image (first image in array, or empty string)
    const mainImage = imageObjects.length > 0 ? imageObjects[0].url : '';

    // Parse attributes if provided (for sizes in clothes)
    let parsedAttributes = {};
    if (attributes) {
      try {
        parsedAttributes = typeof attributes === 'string' ? JSON.parse(attributes) : attributes;
      } catch (e) {
        console.error('Error parsing attributes:', e);
      }
    }

    // Parse groups if provided
    let parsedGroups = [];
    if (groups) {
      try {
        parsedGroups = typeof groups === 'string' ? JSON.parse(groups) : groups;
        if (!Array.isArray(parsedGroups)) {
          parsedGroups = [];
        }
      } catch (e) {
        console.error('Error parsing groups:', e);
      }
    }

    // Create new product
    const newlyCreatedProduct = new Product({
      image: mainImage,
      images: imageObjects,
      title,
      description,
      price: parseFloat(price),
      category,
      brand,
      salePrice: salePrice ? parseFloat(salePrice) : undefined,
      totalStock: parseInt(totalStock),
      size: size || undefined,
      fragranceType: fragranceType || undefined,
      color: color || undefined,
      material: material || undefined,
      fit: fit || undefined,
      gender,
      attributes: Object.keys(parsedAttributes).length > 0 ? parsedAttributes : undefined,
      groups: parsedGroups.length > 0 ? parsedGroups : [],
      isActive: true
    });

    await newlyCreatedProduct.save();

    res.status(201).json({
      success: true,
      message: "Product added successfully",
      data: newlyCreatedProduct,
    });
  } catch (e) {
    console.error('Error adding product:', e);
    
    // Clean up uploaded files if product creation fails
    deleteUploadedFiles(uploadedFiles);
    
    res.status(500).json({
      success: false,
      message: "Add new product failed",
      error: e.message
    });
  }
};
//* --------- fetch  products --------------- */
const fetchAllProduct = async (req, res) => {
    try {
        const listOfProducts = await Product.find({}).populate('brand', 'name nameEn')
        res.status(200).json({
            success: true,
            message: "Products fetched successfully",
            data: listOfProducts
        });
    } catch (e) {
        console.log(e)
        res.status(500).json({
            success: false,
            message: " Fetch products failed"
        })
    }
}

//* --------- edit any product --------------- */
/**
 * Edit an existing product
 * Supports updating product fields and optionally replacing images
 * If new images are uploaded, they replace the old ones
 */
const editProduct = async (req, res) => {
  const uploadedFiles = [];
  let oldImages = [];
  
  try {
    const { id } = req.params;
    const files = req.files || [];
    uploadedFiles.push(...files);

    const {
      title,
      description,
      price,
      category,
      brand,
      salePrice,
      totalStock,
      size,
      fragranceType,
      color,
      material,
      fit,
      gender,
      attributes,
      groups,
      keepOldImages // Optional: if true, keep old images when new ones are uploaded
    } = req.body;

    const findProduct = await Product.findById(id);
    if (!findProduct) {
      deleteUploadedFiles(uploadedFiles);
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    // Store old images for potential cleanup
    oldImages = [...(findProduct.images || [])];

    // Update product fields
    if (title !== undefined) findProduct.title = title;
    if (description !== undefined) findProduct.description = description;
    if (category !== undefined) findProduct.category = category;
    if (brand !== undefined) findProduct.brand = brand;
    if (price !== undefined) findProduct.price = price === '' ? 0 : parseFloat(price);
    if (salePrice !== undefined) findProduct.salePrice = salePrice === '' ? 0 : parseFloat(salePrice);
    if (totalStock !== undefined) findProduct.totalStock = parseInt(totalStock);
    if (size !== undefined) findProduct.size = size;
    if (fragranceType !== undefined) findProduct.fragranceType = fragranceType;
    if (color !== undefined) findProduct.color = color;
    if (material !== undefined) findProduct.material = material;
    if (fit !== undefined) findProduct.fit = fit;
    if (gender !== undefined) findProduct.gender = gender;
    
    // Handle attributes (for sizes in clothes)
    if (attributes !== undefined) {
      try {
        const parsedAttributes = typeof attributes === 'string' ? JSON.parse(attributes) : attributes;
        findProduct.attributes = parsedAttributes;
      } catch (e) {
        console.error('Error parsing attributes:', e);
      }
    }
    
    // Handle groups
    if (groups !== undefined) {
      try {
        const parsedGroups = typeof groups === 'string' ? JSON.parse(groups) : groups;
        findProduct.groups = Array.isArray(parsedGroups) ? parsedGroups : [];
      } catch (e) {
        console.error('Error parsing groups:', e);
      }
    }

    // Handle image updates
    if (files.length > 0) {
      // Process new uploaded images
      const newImageObjects = files.map(file => ({
        filename: file.filename,
        path: file.path,
        url: `/uploads/products/${file.filename}`,
        mimetype: file.mimetype,
        size: file.size
      }));

      // If keepOldImages is true, combine old and new images
      if (keepOldImages === 'true' || keepOldImages === true) {
        findProduct.images = [...oldImages, ...newImageObjects];
      } else {
        findProduct.images = newImageObjects;
      }

      // Update main image to first image
      if (findProduct.images.length > 0) {
        findProduct.image = findProduct.images[0].url;
      }

      // Note: In production, you might want to delete old image files here
      // For now, we keep them to avoid breaking existing references
    }

    await findProduct.save();

    res.status(200).json({
      success: true,
      message: "Product updated successfully",
      data: findProduct,
    });
  } catch (e) {
    console.error('Error editing product:', e);
    
    // Clean up uploaded files if update fails
    deleteUploadedFiles(uploadedFiles);
    
    res.status(500).json({
      success: false,
      message: "Edit product failed",
      error: e.message
    });
  }
};

//* --------- Delete product --------------- */
/**
 * Delete a product and optionally its associated image files
 * Note: Currently only deletes from database. File cleanup can be added if needed.
 */
const deleteProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const product = await Product.findByIdAndDelete(id);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Delete product failed: Not found",
      });
    }

    // Optionally delete associated image files
    // This would require additional file system operations
    // For now, we'll keep the files to avoid breaking references

    res.status(200).json({
      success: true,
      message: "Product deleted successfully",
    });
  } catch (e) {
    console.log(e);
    res.status(500).json({
      success: false,
      message: "Delete product failed",
      error: e.message
    });
  }
};

module.exports = {
    handleImageUpload,
    addProduct,
    fetchAllProduct,
    editProduct,
    deleteProduct,
};