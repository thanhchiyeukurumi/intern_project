const { body } = require('express-validator');
const db = require('models');
const { Category, Language } = db;

const createPostValidation = [
  body('title')
    .notEmpty().withMessage('Tiêu đề là bắt buộc')
    .isLength({ min: 5, max: 100 }).withMessage('Tiêu đề phải từ 5-100 ký tự'),
  
  body('content')
    .notEmpty().withMessage('Nội dung là bắt buộc')
    .isLength({ min: 10 }).withMessage('Nội dung phải ít nhất 10 ký tự'),
  
  body('description')
    .notEmpty().withMessage('Mô tả là bắt buộc')
    .isLength({ min: 10, max: 500 }).withMessage('Mô tả phải từ 10-500 ký tự'),
  
  body('language_id')
    .notEmpty().withMessage('Ngôn ngữ là bắt buộc')
    .isInt().withMessage('ID ngôn ngữ phải là số nguyên')
    .custom(async (languageId) => {
      const language = await Language.findByPk(languageId);
      if (!language) {
        throw new Error('Ngôn ngữ không tồn tại');
      }
      return true;
    }),
  
  body('categories')
    .isArray().withMessage('Danh mục phải là một mảng')
    .notEmpty().withMessage('Ít nhất phải chọn một danh mục')
    .custom(async (categories) => {
      if (!categories || !categories.length) return true;
      
      // Kiểm tra tất cả id category có tồn tại không
      const categoryIds = Array.isArray(categories) ? categories : [categories];
      const foundCategories = await Category.findAll({
        where: { id: categoryIds }
      });
      
      if (foundCategories.length !== categoryIds.length) {
        throw new Error('Một hoặc nhiều danh mục không tồn tại');
      }
      
      return true;
    }),
  
  body('original_post_id')
    .optional()
    .isInt().withMessage('ID bài viết gốc phải là số nguyên')
];

const updatePostValidation = [
  body('title')
    .optional()
    .isLength({ min: 5, max: 100 }).withMessage('Tiêu đề phải từ 5-100 ký tự'),
  
  body('content')
    .optional()
    .isLength({ min: 10 }).withMessage('Nội dung phải ít nhất 10 ký tự'),
  
  body('description')
    .optional()
    .isLength({ min: 10, max: 500 }).withMessage('Mô tả phải từ 10-500 ký tự'),
  
  body('language_id')
    .optional()
    .isInt().withMessage('ID ngôn ngữ phải là số nguyên')
    .custom(async (languageId) => {
      if (!languageId) return true;
      
      const language = await Language.findByPk(languageId);
      if (!language) {
        throw new Error('Ngôn ngữ không tồn tại');
      }
      return true;
    }),
  
  body('categories')
    .optional()
    .isArray().withMessage('Danh mục phải là một mảng')
    .custom(async (categories) => {
      if (!categories || !categories.length) return true;
      
      // Kiểm tra tất cả id category có tồn tại không
      const categoryIds = Array.isArray(categories) ? categories : [categories];
      const foundCategories = await Category.findAll({
        where: { id: categoryIds }
      });
      
      if (foundCategories.length !== categoryIds.length) {
        throw new Error('Một hoặc nhiều danh mục không tồn tại');
      }
      
      return true;
    })
];

module.exports = {
  createPostValidation,
  updatePostValidation
}; 