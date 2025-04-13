const categoryService = require("../services/categoryService");
const { ok, created, error, notFound, conflict, customError } = require('../../../utils/responseUtils');

class CategoryController {
    // ============================================
    // LẤY DANH SÁCH DANH MỤC - getAllCategories
    // ============================================
    /**
     * GET /categories
     * @desc    Lấy danh sách danh mục (có phân trang, tìm kiếm, sắp xếp)
     * @access  Public
     * @query   {number} page       - Trang hiện tại
     * @query   {number} limit      - Số danh mục trên mỗi trang
     * @query   {string} search     - Từ khóa tìm kiếm
     * @query   {string} orderBy    - Trường sắp xếp (vd: name, id)
     * @query   {string} order      - Hướng sắp xếp (ASC | DESC)
     */
    async getAllCategories(req, res) {
        try {
            const options = {
                page: req.query.page || 1,
                limit: req.query.limit || 3,
                search: req.query.search,
                orderBy: req.query.orderBy || 'id',
                order: req.query.order || 'ASC',
            };
            const result = await categoryService.getAllCategories(options);
            return ok(res, result);
        } catch (err) {
            return error(res, err.message);
        }
    }

    // ============================================
    // LẤY DANH MỤC THEO ID - getCategoryById
    // ============================================
    /**
     * GET /categories/:id
     * @desc    Lấy chi tiết danh mục theo ID
     * @access  Public
     */
    async getCategoryById(req, res) {
        try {
            const result = await categoryService.getCategoryById(req.params.id);
            return ok(res, result);
        } catch (err) {
            if (err.statusCode) {
                return notFound(res, err.message);
            }
            return error(res, err.message);
        }
    }

    // ============================================
    // TẠO DANH MỤC - createCategory
    // ============================================
    /**
     * POST /categories
     * @desc    Tạo danh mục mới
     * @access  Admin
     */
    async createCategory(req, res) {
        try {
            const result = await categoryService.createCategory(req.body);
            return created(res, result, 'Danh mục đã được tạo thành công');
        } catch (err) {
            if (err.statusCode == 404) { return notFound(res, err.message);} 
            else if (err.statusCode == 409) { return conflict(res, err.message); }
            return error(res, err.message);
        }
    }

    // ============================================
    // CẬP NHẬT DANH MỤC - updateCategory
    // ============================================
    /**
     * PUT /categories/:id
     * @desc    Cập nhật danh mục theo ID
     * @access  Admin
     */
    async updateCategory(req, res) {
        try {
            const result = await categoryService.updateCategory(req.params.id, req.body);
            return ok(res, result, 'Danh mục đã được cập nhật thành công');
        } catch (err) {
            if (err.statusCode == 404) { return notFound(res, err.message); }
            else if (err.statusCode == 409) { return conflict(res, err.message); }
            else if (err.statusCode == 400) { return customError(res, err.message); }
            return error(res, err.message);
        }
    }

    // ============================================
    // XÓA DANH MỤC - deleteCategory
    // ============================================
    /**
     * DELETE /categories/:id
     * @desc    Xóa danh mục theo ID
     * @access  Admin
     */
    async deleteCategory(req, res) {
        try {
            await categoryService.deleteCategory(req.params.id);
            return ok(res, 'Danh mục đã được xóa thành công');
        } catch (err) {
            if (err.statusCode == 404) { return notFound(res, err.message); }
            return error(res, err.message);
        }
    }
}

module.exports = new CategoryController();
