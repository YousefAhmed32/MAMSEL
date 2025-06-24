const express= require('express');
const {handleImageUpload,addProduct,editProduct,deleteProduct,fetchAllProduct} = require('../../controllers/admin/products-controller');
const { upload } = require('../../helper/cloudinary');

const router = express.Router();
router.post('/image-upload', upload.single('my_file'), handleImageUpload);
router.post('/add',addProduct)
router.get('/get', fetchAllProduct);
router.put('/edit/:id', editProduct);   
router.delete('/delete/:id', deleteProduct);

module.exports = router;