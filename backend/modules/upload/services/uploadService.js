const fs = require('fs');
const path = require('path');
const { cloudinary } = require('../../../configs/cloudinary');

class UploadService {
  /**
   * Xử lý file sau khi upload lên Cloudinary
   * @param {Object} file - File đã được upload qua multer-cloudinary
   * @param {Object} options - Các tùy chọn bổ sung
   * @returns {Object} - Thông tin file đã upload
   */
  processCloudinaryUpload(file, options = {}) {
    // Đối với Cloudinary, file.path sẽ là URL
    // Các thông tin còn nằm trong file metadata
    return {
      url: file.path, // URL Cloudinary
      publicId: file.filename, // Public ID của Cloudinary
      originalName: file.originalname,
      size: file.size,
      format: path.extname(file.originalname).replace('.', ''),
      type: options.type || 'image',
      width: file.width,
      height: file.height,
      createdAt: new Date()
    };
  }

  /**
   * Xử lý file sau khi upload lên disk
   * @param {Object} file - File đã được upload qua multer disk storage
   * @param {Object} options - Các tùy chọn bổ sung
   * @returns {Object} - Thông tin file đã upload
   */
  processLocalUpload(file, options = {}) {
    // Tạo URL public cho file
    const baseUrl = process.env.BASE_URL || `http://localhost:${process.env.PORT || 3000}`;
    const relativePath = file.path.split('public')[1].replace(/\\/g, '/');
    const publicUrl = `${baseUrl}${relativePath}`;

    return {
      url: publicUrl,
      path: file.path,
      originalName: file.originalname,
      filename: file.filename,
      size: file.size,
      format: path.extname(file.originalname).replace('.', ''),
      type: options.type || 'image',
      createdAt: new Date()
    };
  }

  /**
   * Xử lý nhiều file đã upload lên Cloudinary
   * @param {Array} files - Mảng các file đã được upload
   * @param {Object} options - Các tùy chọn bổ sung
   * @returns {Array} - Mảng thông tin các file đã upload
   */
  processMultipleCloudinaryUploads(files, options = {}) {
    return files.map(file => this.processCloudinaryUpload(file, options));
  }

  /**
   * Xử lý nhiều file đã upload lên disk
   * @param {Array} files - Mảng các file đã được upload
   * @param {Object} options - Các tùy chọn bổ sung
   * @returns {Array} - Mảng thông tin các file đã upload
   */
  processMultipleLocalUploads(files, options = {}) {
    return files.map(file => this.processLocalUpload(file, options));
  }

  /**
   * Xử lý multipleFields từ multer fields
   * @param {Object} filesObj - Đối tượng các files từ multer fields
   * @param {Object} options - Các tùy chọn bổ sung
   * @returns {Object} - Đối tượng chứa thông tin các files đã upload
   */
  processFieldsUpload(filesObj, options = {}) {
    const result = {};
    for (const field in filesObj) {
      if (filesObj[field].length === 1) {
        // Nếu chỉ có 1 file, trả về thông tin file đó
        result[field] = this.processCloudinaryUpload(filesObj[field][0], options);
      } else {
        // Nếu có nhiều file, trả về mảng thông tin các file
        result[field] = this.processMultipleCloudinaryUploads(filesObj[field], options);
      }
    }
    return result;
  }

  /**
   * Xóa file trên Cloudinary
   * @param {String} publicId - Public ID của file trên Cloudinary
   * @returns {Promise} - Kết quả xóa file
   */
  async deleteFromCloudinary(publicId) {
    try {
      const result = await cloudinary.uploader.destroy(publicId);
      return result;
    } catch (error) {
      throw new Error(`Lỗi khi xóa file từ Cloudinary: ${error.message}`);
    }
  }

  /**
   * Xóa file trên local disk
   * @param {String} filePath - Đường dẫn tới file cần xóa
   * @returns {Promise} - Kết quả xóa file
   */
  async deleteFromDisk(filePath) {
    return new Promise((resolve, reject) => {
      fs.unlink(filePath, (err) => {
        if (err) {
          reject(new Error(`Lỗi khi xóa file trên disk: ${err.message}`));
        } else {
          resolve({ success: true });
        }
      });
    });
  }

  /**
   * Xử lý upload từ QuillJS editor
   * @param {Object} file - File đã được upload
   * @returns {Object} - Thông tin file cần trả về cho QuillJS
   */
  processEditorUpload(file) {
    // QuillJS cần một response đặc biệt với URL của ảnh
    return {
      url: file.path, // URL từ Cloudinary
      alt: file.originalname
    };
  }
}

module.exports = new UploadService(); 