/**
 * Comment Validation Rules
 * -----------------------------
 * @desc    Tập hợp các rule xác thực dữ liệu đầu vào cho API Tạo và Cập nhật bình luận
 * @usage   Sử dụng trong middleware để kiểm tra dữ liệu từ request body  
 */

const { BodyWithLocale } = require('kernels/rules');

// ============================================
// TẠO BÌNH LUẬN MỚI - createCommentValidation
// ============================================
/**
 * Rule cho việc tạo bình luận:
 * - content: bắt buộc, chuỗi, độ dài từ 1 đến 1000 ký tự
 */
const createCommentValidation = [
  new BodyWithLocale('content')
    .notEmpty()
    .isLength({ min: 1, max: 1000 })
    .get(),
];

const updateCommentValidation = [
  new BodyWithLocale('content')
    .notEmpty()
    .isLength({ min: 1, max: 1000 })
    .get(),
];

module.exports = {
  createCommentValidation,
  updateCommentValidation
}; 