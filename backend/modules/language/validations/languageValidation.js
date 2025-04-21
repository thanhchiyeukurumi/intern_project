/**
 * Language Validation Rules
 * -----------------------------
 * @desc    Tập hợp các rule xác thực dữ liệu đầu vào cho API Tạo và Cập nhật ngôn ngữ
 * @usage   Sử dụng trong middleware để kiểm tra dữ liệu từ request body
 */

const { BodyWithLocale } = require('kernels/rules');

// ============================================
// TẠO NGÔN NGỮ - createLanguageValidation
// ============================================
/**
 * Rule cho việc tạo ngôn ngữ:
 * - locale: bắt buộc, chuỗi, độ dài từ 2 đến 5 ký tự, không hợp lệ (ví dụ: en, en-US)
 * - name: bắt buộc, chuỗi, độ dài từ 2 đến 50 ký tự
 * - is_active: tùy chọn, boolean
 */ 
const createLanguageValidation = [
  new BodyWithLocale('locale')
    .notEmpty()
    .isLength({ min: 2, max: 5 })
    .matches(/^[a-z]{2}(-[A-Z]{2})?$/)
    .get(),
  
  new BodyWithLocale('name')
    .notEmpty()
    .isLength({ min: 2, max: 50 })
    .get(),
  
  new BodyWithLocale('is_active')
    .optional()
    .isBoolean()
    .get(), 
];

// ============================================
// CẬP NHẬT NGÔN NGỮ - updateLanguageValidation
// ============================================
/**
 * Rule cho việc cập nhật ngôn ngữ:
 * - locale: tùy chọn, chuỗi, độ dài từ 2 đến 5 ký tự, không hợp lệ (ví dụ: en, en-US)
 * - name: tùy chọn, chuỗi, độ dài từ 2 đến 50 ký tự
 * - is_active: tùy chọn, boolean
 */
const updateLanguageValidation = [
  new BodyWithLocale('locale')
    .optional()
    .isLength({ min: 2, max: 5 })
    .matches(/^[a-z]{2}(-[A-Z]{2})?$/)
    .get(),
  
  new BodyWithLocale('name')
    .optional()
    .isLength({ min: 2, max: 50 })
    .get(),
  
  new BodyWithLocale('is_active')
    .optional()
    .isBoolean()
    .get(),
];

module.exports = {
  createLanguageValidation,
  updateLanguageValidation
}; 