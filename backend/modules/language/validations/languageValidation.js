const { body } = require('express-validator');

const createLanguageValidation = [
  body('locale')
    .notEmpty().withMessage('Locale là bắt buộc')
    .isLength({ min: 2, max: 5 }).withMessage('Locale phải từ 2-5 ký tự')
    .matches(/^[a-z]{2}(-[A-Z]{2})?$/).withMessage('Locale không hợp lệ (ví dụ: en, en-US)'),
  
  body('name')
    .notEmpty().withMessage('Tên ngôn ngữ là bắt buộc')
    .isLength({ min: 2, max: 50 }).withMessage('Tên ngôn ngữ phải từ 2-50 ký tự'),
  
  body('is_active')
    .optional()
    .isBoolean().withMessage('is_active phải là boolean')
];

const updateLanguageValidation = [
  body('locale')
    .optional()
    .isLength({ min: 2, max: 5 }).withMessage('Locale phải từ 2-5 ký tự')
    .matches(/^[a-z]{2}(-[A-Z]{2})?$/).withMessage('Locale không hợp lệ (ví dụ: en, en-US)'),
  
  body('name')
    .optional()
    .isLength({ min: 2, max: 50 }).withMessage('Tên ngôn ngữ phải từ 2-50 ký tự'),
  
  body('is_active')
    .optional()
    .isBoolean().withMessage('is_active phải là boolean')
];

module.exports = {
  createLanguageValidation,
  updateLanguageValidation
}; 