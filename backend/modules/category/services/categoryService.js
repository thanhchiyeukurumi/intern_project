const db = require('models');
const { Category, PostCategory } = db;
const { Op } = require('sequelize');

class CategoryService {
    /**
     * Get All Categories
     * -----------------------------
     * @desc    Lấy danh sách danh mục có phân trang, tìm kiếm (theo tên), sắp xếp
     * @param   {Object} options - { page, limit, search, orderBy, order }
     * @returns {Object} { data: [...], pagination: { total, page, limit } }
     */
    async getAllCategories(options = {}) {
        try {
            const page = parseInt(options.page, 10) || 1;
            const limit = parseInt(options.limit, 10) || 3;
            const search = options.search || null;
            const orderBy = options.orderBy || 'id';
            const order = options.order || 'ASC';

            const offset = (page - 1) * limit;
            const where = {};

            // Tìm kiếm theo tên danh mục (LIKE, không phân biệt hoa thường) (collation: utf8mb4_0900_ai_ci)
            if (search) {
                where[Op.or] = [
                    { name: { [Op.like]: `%${search}%` } }
                ];
            }

            const queryOptions = {
                where,
                order: [[orderBy, order]],
                limit,
                offset,
                distinct: true,
                attributes: { exclude: ['createdAt', 'updatedAt'] }
            };

            const { count, rows } = await Category.findAndCountAll(queryOptions);
            return {
                data: rows,
                pagination: {
                    total: count,
                    page,
                    limit
                }
            };
        } catch (error) {
            throw error;
        }
    }

    /**
     * Get Category By ID
     * -----------------------------
     * @desc    Lấy chi tiết danh mục theo ID
     * @param   {Number} id
     * @returns {Object} category
     */
    async getCategoryById(id) {
        try {
            const category = await Category.findByPk(id);
            if (!category) {
                throw new Error('Không tìm thấy danh mục');
            }
            return category;
        } catch (error) {
            throw error;
        }
    }

    /**
     * Create New Category
     * -----------------------------
     * @desc    Tạo danh mục mới
     * @param   {Object} data
     * @returns {Object} category
     */
    async createCategory(data) {
        try {
            const category = await Category.create({
                name: data.name,
                parent_id: data.parent_id || null
            });
            return category;
        } catch (error) {
            throw error;
        }
    }

    /**
     * Update Category By ID
     * -----------------------------
     * @desc    Cập nhật danh mục theo ID
     * @param   {Number} id 
     * @param   {Object} data
     * @returns {Object} updated category
     */
    async updateCategory(id, data) {
        try {
            const category = await Category.findByPk(id);
            if (!category) {
                throw new Error('Không tìm thấy danh mục');
            }

            await category.update(data);
            return category;
        } catch (error) {
            throw error;
        }
    }

    /**
     * Delete Category By ID
     * -----------------------------
     * @desc    Xóa danh mục theo ID
     * @param   {Number} id
     */
    async deleteCategory(id) {
        try {
            const category = await Category.findByPk(id);
            if (!category) {
                throw new Error('Không tìm thấy danh mục');
            }

            // TODO: Kiểm tra xem danh mục có đang được dùng trong PostCategory không trước khi xóa

            await category.destroy();
        } catch (error) {
            throw error;
        }
    }
}

module.exports = new CategoryService();
