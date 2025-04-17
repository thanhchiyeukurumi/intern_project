/**
 * Auth Validation Rules
 * -----------------------------
 * @desc    Tập hợp các rule xác thực dữ liệu đầu vào cho API Đăng ký và Đăng nhập
 * @usage   Sử dụng trong middleware để kiểm tra dữ liệu từ request body
 */

const { BodyWithLocale } = require('kernels/rules');

// ============================================
// ĐĂNG KÝ TÀI KHOẢN MỚI - registerValidation
// ============================================
/**
 * Validation rules cho đăng ký tài khoản
 */
const registerValidation = [
  new BodyWithLocale('username')
    .notEmpty()
    .isLength({ min: 5, max: 50 })
    .matches(/^[a-zA-Z0-9_]+$/)
    .get(),
  
  new BodyWithLocale('fullname')
    .notEmpty()
    .isLength({ min: 2, max: 100 })
    .get(),
  
  new BodyWithLocale('email')
    .notEmpty()
    .isEmail()
    .get(),
  
  new BodyWithLocale('password')
    .notEmpty()
    .isLength({ min: 6 })
    .matches(/\d/)
    .get(),
];

// ============================================
// ĐĂNG NHẬP - loginValidation
// ============================================
/**
 * Validation rules cho đăng nhập
 * - email: bắt buộc, định dạng email
 * - password: bắt buộc, độ dài từ 6 ký tự trở lên, chứa ít nhất 1 số
 */
const loginValidation = [
  new BodyWithLocale('email')
    .notEmpty()
    .isEmail()
    .get(),
  
  new BodyWithLocale('password')
    .notEmpty()
    .isLength({ min: 6 })
    .matches(/\d/)
    .get(),
];

module.exports = {
  registerValidation,
  loginValidation
}; 