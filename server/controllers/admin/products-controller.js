const { ImageUploadUtil } = require("../../helper/cloudinary");
const Product = require("../../models/Product");

const handleImageUpload = async (req, res) => {
    try {
        const b64 = Buffer.from(req.file.buffer).toString('base64');
        const url = `data:${req.file.mimetype};base64,${b64}`;
        const result = await ImageUploadUtil(url);

        res.json({
            success: true,
            result
        });
    } catch (e) {
        console.error(e);
        res.json({
            success: false,

            message: "Image upload failed"
        });
    }

};

//* --------- Add New product --------------- */
const addProduct = async (req, res) => {
  try {
    const {
      image,
      title,
      description,
      price,
      category,
      brand,
      salePrice,
      totalStock
    } = req.body;

    const newlyCreatedProduct = new Product({
      image,
      title,
      description,
      price,
      category,
      brand,
      salePrice,
      totalStock,
    });

    await newlyCreatedProduct.save();

    res.status(201).json({
      success: true,
      message: "Product added successfully",
      data: newlyCreatedProduct,
    });
  } catch (e) {
    res.status(500).json({
      success: false,
      message: "Add new product failed",
    });
  }
};
//* --------- fetch  products --------------- */
const fetchAllProduct = async (req, res) => {
    try {
        const listOfProducts = await Product.find({})
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
const editProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      image,
      title,
      description,
      price,
      category,
      brand,
      salePrice,
      totalStock
    } = req.body;

    const findProduct = await Product.findById(id);
    if (!findProduct) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    findProduct.title = title || findProduct.title;
    findProduct.image = image || findProduct.image;
    findProduct.description = description || findProduct.description;
    findProduct.category = category || findProduct.category;
    findProduct.brand = brand || findProduct.brand;
    findProduct.price = price === '' ? 0 : price || findProduct.price;
    findProduct.salePrice = salePrice ==='' ? 0  : salePrice || findProduct.salePrice;
    findProduct.totalStock = totalStock || findProduct.totalStock;

    await findProduct.save();

    res.status(200).json({
      success: true,
      message: "Product updated successfully",
      data: findProduct,
    });
  } catch (e) {
    console.log(e);
    res.status(500).json({
      success: false,
      message: "Edit product failed",
    });
  }
};
//* --------- delete any product --------------- */
const deleteProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const product = await Product.findByIdAndDelete(id); // ✅ أضف await

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Delete product failed: Not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Product deleted successfully",
    });
  } catch (e) {
    console.log(e);
    res.status(500).json({
      success: false,
      message: "Delete product failed",
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