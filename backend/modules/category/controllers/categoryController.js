const categoryService = require("../services/categoryService");
const { ok, created, error } = require('../../../utils/responseUtils');

class CategoryController {
    /**
     * Lấy danh sách danh mục
     */
    async getAllCategories(req, res) {
        try {
            const categories = await categoryService.getAllCategories();
            return ok(res, categories);
        } catch (err) {
            return error(res, err.message);
        }
    }

    /**
     * Lấy danh sách danh mục theo id
     */
    async getCategoryById(req, res) {
        try {
            const category = await categoryService.getCategoryById(req.params.id);
            return ok(res, category);
        } catch (err) {
            return error(res, err.message);
        }
    }
    
    /**
     * Tạo danh mục mới
     */
    async createCategory(req, res) {
        try {
            const category = await categoryService.createCategory(req.body);
            return created(res, category, 'Danh mục đã được tạo thành công');
        } catch (err) {
            return error(res, err.message);
        }
    }

    /**
     * Cập nhật danh mục
     */
    async updateCategory(req, res) {
        try {
            const category = await categoryService.updateCategory(req.params.id, req.body);
            return ok(res, category, 'Danh mục đã được cập nhật thành công');
        } catch (err) {
            return error(res, err.message);
        }
    }

    /**
     * Xóa danh mục
     */
    async deleteCategory(req, res) {
        try {
            await categoryService.deleteCategory(req.params.id);
            return ok(res, 'Danh mục đã được xóa thành công');
        } catch (err) {
            return error(res, err.message);
        }
    }
}

module.exports = new CategoryController();
