const { BodyWithLocale } = require('kernels/rules');

/**
 * Validation rules cho đăng ký tài khoản
 */
const registerValidation = [
  new BodyWithLocale('username')
    .notEmpty()
    .isLength({ min: 3, max: 50 })
    .withMessage('Tên đăng nhập phải từ 3-50 ký tự')
    .matches(/^[a-zA-Z0-9_]+$/)
    .withMessage('Tên đăng nhập chỉ được chứa chữ cái, số và dấu gạch dưới')
    .get(),
  
  new BodyWithLocale('fullname')
    .notEmpty()
    .isLength({ min: 2, max: 100 })
    .withMessage('Họ tên phải từ 2-100 ký tự')
    .get(),
  
  new BodyWithLocale('email')
    .notEmpty()
    .isEmail()
    .withMessage('Email không hợp lệ')
    .get(),
  
  new BodyWithLocale('password')
    .notEmpty()
    .isLength({ min: 6 })
    .withMessage('Mật khẩu phải có ít nhất 6 ký tự')
    .matches(/\d/)
    .withMessage('Mật khẩu phải chứa ít nhất 1 số')
    .get(),
  
  new BodyWithLocale('confirmPassword')
    .notEmpty()
    .confirmed('password')
    .withMessage('Xác nhận mật khẩu không khớp')
    .get(),
  
  new BodyWithLocale('description')
    .isString()
    .get()
];

/**
 * Validation rules cho đăng nhập
 */
const loginValidation = [
  new BodyWithLocale('email')
    .notEmpty()
    .isEmail()
    .withMessage('Email không hợp lệ')
    .get(),
  
  new BodyWithLocale('password')
    .notEmpty()
    .get()
];

module.exports = {
  registerValidation,
  loginValidation
}; 