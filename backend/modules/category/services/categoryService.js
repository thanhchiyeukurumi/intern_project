const db = require('models');
const {Category, PostCategory} = db;

class CategoryService {
    /**
     * Lấy danh sách danh mục
     */
    async getAllCategories() {
        try {
            const categories = await Category.findAll({
                order: [['id', 'ASC']]
            });
            return categories;
        } catch (error) {
            throw error;
        }
    }   

    /**
     * Lấy danh sách danh mục theo id
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
     * Tạo danh mục mới 
     */
    async createCategory(data) {
        try {
            const category = await Category.create(data);
            return category;
        } catch (error) {
            throw error;
        }
    }

    /**
     * Cập nhật danh mục
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
     * Xóa danh mục
     */
    async deleteCategory(id) {
        try {
            const category = await Category.findByPk(id);
            if (!category) {
                throw new Error('Không tìm thấy danh mục');
            }
            
        } catch (error) {
            throw error;
        }
    }           
}

module.exports = new CategoryService();

/**
 * TODO: Kiểm tra category trong cái PostCategory 
 */