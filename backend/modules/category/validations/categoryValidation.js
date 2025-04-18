const { body } = require('express-validator');

const createCategoryValidation = [
    body('name')
        .notEmpty().withMessage('Tên danh mục là bắt buộc')
        .isLength({ min: 2, max: 50 }).withMessage('Tên danh mục phải từ 2-50 ký tự'),
    
    body('parent_id')
        .optional()
        .isInt().withMessage('parent_id phải là số nguyên')
        .custom((value) => {
            if (value !== null && value !== undefined) {
                return Category.findByPk(value).then((category) => {
                    if (!category) {
                        return Promise.reject('Danh mục cha không tồn tại');
                    }
                });
            }
            return Promise.resolve();
        })
]

const updateCategoryValidation = [
    body('name')
        .optional()
        .isLength({ min: 2, max: 50 }).withMessage('Tên danh mục phải từ 2-50 ký tự'),
    
    body('parent_id')
        .optional()
        .isInt().withMessage('parent_id phải là số nguyên')
        .custom((value) => {
            if (value !== null && value !== undefined) {
                return Category.findByPk(value).then((category) => {
                    if (!category) {
                        return Promise.reject('Danh mục cha không tồn tại');
                    }
                });
            }
            return Promise.resolve();
        })
]

module.exports = {
    createCategoryValidation,
    updateCategoryValidation
}

