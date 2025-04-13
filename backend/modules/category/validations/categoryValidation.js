/**
 * Category Validation Rules
 * -----------------------------
 * @desc    Tập hợp các rule xác thực dữ liệu đầu vào cho API Tạo và Cập nhật danh mục
 * @usage   Sử dụng trong middleware để kiểm tra dữ liệu từ request body
 */

const { Category } = require('models');
const { BodyWithLocale } = require('kernels/rules');

// ============================================
// TẠO DANH MỤC - createCategoryValidation
// ============================================
/**
 * Rule cho việc tạo danh mục:
 * - name: bắt buộc, chuỗi, độ dài từ 2 đến 50 ký tự
 * - parent_id: tùy chọn, nếu có thì phải tồn tại trong bảng Category
 */
const createCategoryValidation = [
    new BodyWithLocale('name')
        .notEmpty()                             // Không được bỏ trống
        .isString()                             // Phải là chuỗi
        .isLength({ min: 2, max: 50 })          // Từ 2 - 50 ký tự
        .get(),
    
    new BodyWithLocale('parent_id')
        .optional()                             // Có thể không truyền
        .get(),
];

// ============================================
// CẬP NHẬT DANH MỤC - updateCategoryValidation
// ============================================
/**
 * Rule cho việc cập nhật danh mục:
 * - name: bắt buộc, chuỗi, độ dài từ 2 đến 50 ký tự
 * - parent_id: tùy chọn, nếu có thì phải tồn tại trong bảng Category
 * (Giống với create, nhưng dùng riêng để dễ mở rộng về sau)
 */
const updateCategoryValidation = [
    new BodyWithLocale('name')
        .notEmpty()
        .isString()
        .isLength({ min: 2, max: 50 })
        .get(),
    
    new BodyWithLocale('parent_id')
        .optional()
        .existsIn(Category, 'id')
        .get()
];

module.exports = {
    createCategoryValidation,
    updateCategoryValidation
};
