const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');

// Cấu hình Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Tạo instance cloudinaryStorage để sử dụng với multer
const createCloudinaryStorage = (folder = 'uploads') => {
  return new CloudinaryStorage({
    cloudinary: cloudinary,
    params: {
      folder: folder,
      allowed_formats: ['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg', 'pdf'],
      transformation: [{ width: 1000, quality: 'auto' }],
    },
  });
};

module.exports = {
  cloudinary,
  createCloudinaryStorage,
}; 