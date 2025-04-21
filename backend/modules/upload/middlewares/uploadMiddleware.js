const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { createCloudinaryStorage } = require('../../../configs/cloudinary');

// Cấu hình Multer lưu trữ trên disk (local storage)
const createDiskStorage = (destination) => {
  // Tạo thư mục nếu không tồn tại
  if (!fs.existsSync(destination)) {
    fs.mkdirSync(destination, { recursive: true });
  }

  return multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, destination);
    },
    filename: function (req, file, cb) {
      // Tạo tên file duy nhất bằng cách thêm timestamp
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
      const ext = path.extname(file.originalname);
      cb(null, file.fieldname + '-' + uniqueSuffix + ext);
    }
  });
};

// Kiểm tra loại file
const fileFilter = (req, file, cb) => {
  // Chấp nhận các định dạng hình ảnh
  const allowedTypes = /jpeg|jpg|png|gif|webp|svg/;
  
  // Kiểm tra MIME type
  const mimeOk = allowedTypes.test(file.mimetype);
  
  // Kiểm tra extension
  const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
  
  if (mimeOk && extname) {
    return cb(null, true);
  }
  
  cb(new Error('Chỉ chấp nhận file hình ảnh: jpg, jpeg, png, gif, webp, svg'), false);
};

// Cấu hình Multer cho local storage
const localUpload = multer({
  storage: createDiskStorage(path.join(process.cwd(), 'public', process.env.UPLOAD_FOLDER || 'uploads')),
  limits: { fileSize: 5 * 1024 * 1024 }, // Giới hạn 5MB
  fileFilter: fileFilter
});

// Cấu hình Multer cho Cloudinary storage
const cloudinaryUpload = multer({
  storage: createCloudinaryStorage(process.env.UPLOAD_FOLDER || 'uploads'),
  limits: { fileSize: 5 * 1024 * 1024 }, // Giới hạn 5MB
  fileFilter: fileFilter
});

// Các middleware riêng cho từng trường hợp sử dụng
const uploadMiddleware = {
  // Upload đơn - Cloudinary
  uploadSingleImage: cloudinaryUpload.single('image'), // Chỉ định Multer chỉ tìm và xử lý 1 file duy nhất từ field có tên là 'image' trong muilitpart data
  uploadSingleAvatar: cloudinaryUpload.single('avatar'),
  
  // Upload nhiều - Cloudinary (tối đa 10 ảnh)
  uploadMultipleImages: cloudinaryUpload.array('images', 10),
  
  // Upload cho specific field - Cloudinary
  uploadFields: cloudinaryUpload.fields([
    { name: 'thumbnail', maxCount: 1 },
    { name: 'images', maxCount: 5 }
  ]),
  
  // Upload đơn - Local
  uploadSingleImageLocal: localUpload.single('image'),
  uploadSingleAvatarLocal: localUpload.single('avatar'),
  
  // Upload nhiều - Local (tối đa 10 ảnh)
  uploadMultipleImagesLocal: localUpload.array('images', 10),
  
  // Upload cho editor - Cloudinary
  uploadEditorImage: cloudinaryUpload.single('upload') // QuillJS thường sử dụng 'upload' làm tên field
};

module.exports = uploadMiddleware; 