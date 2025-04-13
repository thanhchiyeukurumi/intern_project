const { check } = require('express-validator');

// Validation cho upload file đơn
const uploadSingleValidation = [
  check('type')
    .optional()
    .isIn(['avatar', 'thumbnail', 'post', 'gallery', 'product'])
    .withMessage('Loại file không hợp lệ')
];

// Validation cho upload nhiều file
const uploadMultipleValidation = [
  check('type')
    .optional()
    .isIn(['avatar', 'thumbnail', 'post', 'gallery', 'product'])
    .withMessage('Loại file không hợp lệ')
];

// Validation trước khi upload file trong QuillJS
const uploadEditorPreValidation = [
  // Có thể thêm các validation cho tham số khác nếu cần
  check('type')
    .optional()
    .isIn(['editor', 'post', 'content'])
    .withMessage('Loại file không hợp lệ')
];

// Validation sau khi upload file trong QuillJS
const uploadEditorPostValidation = [
  check('upload')
    .custom((value, { req }) => {
      if (!req.file) {
        throw new Error('Vui lòng chọn file cần upload');
      }
      return true;
    })
];

// Validation cho việc xóa file
const deleteFileValidation = [
  check('publicId')
    .notEmpty()
    .withMessage('PublicId không được để trống')
];

module.exports = {
  uploadSingleValidation,
  uploadMultipleValidation,
  uploadEditorPreValidation,
  uploadEditorPostValidation,
  deleteFileValidation
}; 