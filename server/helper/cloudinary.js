const cloudinary = require('cloudinary').v2;
const multer = require('multer');

cloudinary.config({
     cloud_name: 'dfzgiebus', 
        api_key: '942859652132982', 
        api_secret: 'He_kzvl3i9I5cflvtltS8xj1SS8'
});

const storage = multer.memoryStorage();

async function ImageUploadUtil(file) {
    const result = await cloudinary.uploader.upload(file, {
        resource_type: 'auto',
    });
    return result;
}

const upload = multer({ storage });

module.exports = {
    ImageUploadUtil,
    upload
};
