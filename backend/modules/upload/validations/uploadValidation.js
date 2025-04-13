const { check } = require('express-validator');

// Validation cho upload file
const uploadValidation = [
  check('type')
    .optional()
    .isIn(['avatar', 'thumbnail', 'post', 'gallery', 'product'])
    .withMessage('Loại file không hợp lệ')
];

// Validation cho upload file trong QuillJS
const uploadEditorValidation = [
  check('upload')
    .custom((value, { req }) => {
      if (!req.file) {
        throw new Error('Vui lòng chọn file cần upload');
      }
      return true;
    })
];

module.exports = {
  uploadValidation,
  uploadEditorValidation
}; 