/**
 * Post Validation Rules
 * -----------------------------
 * @desc    Tập hợp các rule xác thực dữ liệu đầu vào cho API Tạo và Cập nhật bài viết
 * @usage   Sử dụng trong middleware để kiểm tra dữ liệu từ request body
 */

const { BodyWithLocale } = require('kernels/rules');
const { Category, Language } = require('models');

// ============================================
// TẠO BÀI VIẾT MỚI - createPostValidation
// ============================================
/**
 * Rule cho việc tạo bài viết:
 * - title: bắt buộc, chuỗi, độ dài từ 5 đến 100 ký tự
 * - content: bắt buộc, chuỗi, độ dài từ 10 ký tự trở lên
 * - description: bắt buộc, chuỗi, độ dài từ 10 đến 500 ký tự
 */
const createPostValidation = [
  new BodyWithLocale('title')
    .notEmpty()
    .isLength({ min: 5, max: 100 })
    .get(),
  
  new BodyWithLocale('content')
    .notEmpty()
    .isLength({ min: 10 })
    .get(),
  
  new BodyWithLocale('description')
    .notEmpty()
    .isLength({ min: 10, max: 500 })
    .get(),
  
  new BodyWithLocale('language_id') 
    .notEmpty()
    .existsIn(Language, 'id')
    .get(),
  
  new BodyWithLocale('categories')
    .notEmpty()
    .existsIn(Category, 'id')
    .get(),
  
  new BodyWithLocale('original_post_id')
    .optional()
    .get(),
];

// ============================================
// CẬP NHẬT BÀI VIẾT - updatePostValidation
// ============================================
/**
 * Rule cho việc cập nhật bài viết:
 * - title: tùy chọn, chuỗi, độ dài từ 5 đến 100 ký tự
 */
const updatePostValidation = [
  new BodyWithLocale('title')
    .optional()
    .isLength({ min: 5, max: 100 })
    .get(),
  
  new BodyWithLocale('content')
    .optional()
    .isLength({ min: 10 })
    .get(),
  
  new BodyWithLocale('description')
    .optional()
    .isLength({ min: 10, max: 500 })
    .get(),
  
  new BodyWithLocale('language_id')
    .optional()
    .existsIn(Language, 'id')
    .get(),
  
  new BodyWithLocale('categories')  
    .optional()
    .existsIn(Category, 'id')
    .get(),
  
  new BodyWithLocale('original_post_id')
    .optional()
    .get(),
];

module.exports = {
  createPostValidation,
  updatePostValidation
}; 