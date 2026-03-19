const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');
require('dotenv').config();

cloudinary.config({
    cloud_name: process.env.CLOUD_NAME || 'placeholder_cloudname',
    api_key: process.env.CLOUD_API_KEY || '1234567890',
    api_secret: process.env.CLOUD_API_SECRET || 'secret123'
});

const storage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: {
        folder: 'stayhub_DEV',
        allowedFormats: ["png", "jpg", "jpeg"]
    }
});

module.exports = { cloudinary, storage };
