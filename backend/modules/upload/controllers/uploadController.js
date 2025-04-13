const { validationResult } = require('express-validator');
const uploadService = require('../services/uploadService');
const { ok, error, invalidated, created } = require('../../../utils/responseUtils');

class UploadController {
  /**
   * Upload đơn file ảnh (thông thường)
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  async uploadSingleImage(req, res) {
    try {
      // Kiểm tra lỗi validation
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return invalidated(res, errors.array());
      }

      // Kiểm tra file đã được upload qua middleware Multer
      if (!req.file) {
        return error(res, 'Không tìm thấy file cần upload', 400);
      }

      // Lấy loại file từ query hoặc body nếu có
      const type = req.query.type || req.body.type || 'image';

      // Xử lý file upload
      const fileData = uploadService.processCloudinaryUpload(req.file, { type });

      // Trả về kết quả
      return created(res, fileData, 'Upload ảnh thành công');
    } catch (err) {
      return error(res, 'Lỗi upload: ' + err.message, 500);
    }
  }

  /**
   * Upload nhiều file ảnh
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  async uploadMultipleImages(req, res) {
    try {
      // Kiểm tra lỗi validation
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return invalidated(res, errors.array());
      }

      // Kiểm tra files đã được upload qua middleware Multer
      if (!req.files || req.files.length === 0) {
        return error(res, 'Không tìm thấy file cần upload', 400);
      }

      // Lấy loại file từ query hoặc body nếu có
      const type = req.query.type || req.body.type || 'gallery';

      // Xử lý các files upload
      const filesData = uploadService.processMultipleCloudinaryUploads(req.files, { type });

      // Trả về kết quả
      return created(res, filesData, 'Upload nhiều ảnh thành công');
    } catch (err) {
      return error(res, 'Lỗi upload: ' + err.message, 500);
    }
  }

  /**
   * Upload file từ trình soạn thảo (QuillJS)
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  async uploadEditorImage(req, res) {
    try {
      // Kiểm tra file đã được upload qua middleware Multer
      if (!req.file) {
        return res.status(400).json({
          error: 'Không tìm thấy file cần upload'
        });
      }

      // Xử lý file upload cho QuillJS
      const fileData = uploadService.processEditorUpload(req.file);

      // Format đặc biệt cho QuillJS
      return res.status(201).json({
        success: 1,
        file: {
          url: fileData.url,
          // Thêm các trường khác mà frontend cần
        }
      });
    } catch (err) {
      return res.status(500).json({
        success: 0,
        error: err.message
      });
    }
  }

  /**
   * Xóa file đã upload
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  async deleteUploadedFile(req, res) {
    try {
      const { publicId } = req.params;

      if (!publicId) {
        return error(res, 'Không tìm thấy publicId', 400);
      }

      // Xóa file từ Cloudinary
      const result = await uploadService.deleteFromCloudinary(publicId);

      // Kiểm tra kết quả xóa
      if (result.result === 'ok') {
        return ok(res, result, 'Xóa file thành công');
      } else {
        return error(res, 'Không thể xóa file', 400);
      }
    } catch (err) {
      return error(res, 'Lỗi khi xóa file: ' + err.message, 500);
    }
  }
}

module.exports = new UploadController(); 