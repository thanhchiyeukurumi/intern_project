/**
 * User Validation Rules
 * -----------------------------
 * @desc    Tập hợp các rule xác thực dữ liệu đầu vào cho API Tạo và Cập nhật người dùng
 * @usage   Sử dụng trong middleware để kiểm tra dữ liệu từ request body
 */

const { BodyWithLocale } = require('kernels/rules');
const { User } = require('models');

// ============================================
// TẠO NGƯỜI DÙNG - createUserValidation
// ============================================
/**
 * @deprecated: Admin không cần tạo người dùng mới, chỉ cần tạo người dùng mới trong phần đăng ký
 * @desc: Cai nay chi de test
 * Rule cho việc tạo người dùng:
 * - username: bắt buộc, chuỗi, độ dài từ 3 đến 50 ký tự, chỉ chứa chữ cái và số
 * - fullname: bắt buộc, chuỗi, độ dài từ 3 đến 100 ký tự, chỉ chứa chữ cái và số
 * - password: bắt buộc, chuỗi, độ dài từ 6 đến 20 ký tự, chứa ít nhất 1 chữ cái viết hoa, 1 chữ cái viết thường, 1 số và 1 ký tự đặc biệt
 */ 
const createUserValidation = [
    new BodyWithLocale('username')
        .notEmpty()
        .isLength({min: 3, max: 50})
        .matches(/^[a-zA-Z0-9]+$/)
        .get(),
    new BodyWithLocale('fullname')
        .notEmpty()
        .isLength({min: 3, max: 100})
        .get(),
    new BodyWithLocale('password')
        .notEmpty()
        .isLength({min: 6, max: 20})     
        .get(),
    new BodyWithLocale('email')
        .notEmpty()
        .isEmail()
        .get(),
];

// ============================================
// CẬP NHẬT NGƯỜI DÙNG - updateUserValidation
// ============================================
/**
 * Rule cho việc cập nhật người dùng:
 * - username: bắt buộc, chuỗi, độ dài từ 3 đến 50 ký tự, chỉ chứa chữ cái và số
 */
const updateUserValidation = [
    new BodyWithLocale('username')
        .optional()
        .isLength({min: 3, max: 50})
        .matches(/^[a-zA-Z0-9]+$/)
        .get(),
    new BodyWithLocale('fullname')
        .optional()
        .isLength({min: 3, max: 100})
        .get(),
    new BodyWithLocale('email')
        .optional()
        .isEmail()
        .get(),
];

module.exports = {
    createUserValidation,
    updateUserValidation
}

