const { body } = require('express-validator');

/**
 * Validation rules cho đăng ký tài khoản
 */
const registerValidation = [
  body('username')
    .trim()
    .notEmpty().withMessage('Tên đăng nhập không được để trống')
    .isLength({ min: 3, max: 50 }).withMessage('Tên đăng nhập phải từ 3-50 ký tự')
    .matches(/^[a-zA-Z0-9_]+$/).withMessage('Tên đăng nhập chỉ được chứa chữ cái, số và dấu gạch dưới'),
  
  body('fullname')
    .trim()
    .notEmpty().withMessage('Họ tên không được để trống')
    .isLength({ min: 2, max: 100 }).withMessage('Họ tên phải từ 2-100 ký tự'),
  
  body('email')
    .trim()
    .notEmpty().withMessage('Email không được để trống')
    .isEmail().withMessage('Email không hợp lệ')
    .normalizeEmail(),
  
  body('password')
    .notEmpty().withMessage('Mật khẩu không được để trống')
    .isLength({ min: 6 }).withMessage('Mật khẩu phải có ít nhất 6 ký tự')
    .matches(/\d/).withMessage('Mật khẩu phải chứa ít nhất 1 số'),
];

/**
 * Validation rules cho đăng nhập
 */
const loginValidation = [
  body('email')
    .trim()
    .notEmpty().withMessage('Email không được để trống')
    .isEmail().withMessage('Email không hợp lệ')
    .normalizeEmail(),
  
  body('password')
    .notEmpty().withMessage('Mật khẩu không được để trống')
];

module.exports = {
  registerValidation,
  loginValidation
}; 