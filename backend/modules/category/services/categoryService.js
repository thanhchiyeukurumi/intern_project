const db = require('models');
const { Category, PostCategory } = db;
const { Op } = require('sequelize');

class CategoryService {
    // ============================================
    // LẤY DANH SÁCH DANH MỤC - getAllCategories    
    // ============================================
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
                distinct: true, // dung distinct để tránh trùng lặp khi dung include:[]
                attributes: { exclude: ['createdAt', 'updatedAt'] }
            };

            const { count, rows } = await Category.findAndCountAll(queryOptions);
            return {
                data: rows,
                pagination: {
                    total: count,
                    page,
                    limit,
                    totalPages: Math.ceil(count / limit)
                }
            };
        } catch (err) {
            throw err;
        }
    }

    // ============================================
    // LẤY DANH MỤC THEO ID - getCategoryById
    // ============================================
    /**
     * Get Category By ID
     * -----------------------------
     * @desc    Lấy chi tiết danh mục theo ID
     * @param   {Number} id
     * @returns {Object} category
     */
    async getCategoryById(id) {
        try {
            const category = await Category.findByPk(id, {
                attributes: { exclude: ['createdAt', 'updatedAt'] }
            });
            if (!category) {
                const error = new Error('Không tìm thấy danh mục');
                error.statusCode = 404;
                throw error;
            }
            return category;
        } catch (err) {
            throw err;
        }
    }

    // ============================================
    // TẠO DANH MỤC - createCategory
    // ============================================
    /**
     * Create New Category
     * -----------------------------
     * @desc    Tạo danh mục mới, kiểm tra trùng lặp theo name và parent_id
     * @param   {Object} data - Dữ liệu danh mục { name: string, parent_id?: number | null }
     * @returns {Object} category - Danh mục vừa tạo
     * @throws  {Error} Nếu danh mục đã tồn tại hoặc có lỗi khác
     */
    async createCategory(data) {
        // Bắt đầu một transaction để đảm bảo tính toàn vẹn dữ liệu
        const transaction = await db.sequelize.transaction();
        try {
            // Chuẩn hóa parent_id: nếu không cung cấp hoặc là giá trị falsy (trừ 0 nếu 0 là ID hợp lệ), coi là null
            const parentId = data.parent_id || null;
            const categoryName = data.name;

            // --- BƯỚC KIỂM TRA TRÙNG LẶP ---
            const existingCategory = await Category.findOne({
                where: {
                    name: categoryName
                },
                transaction // Thực hiện kiểm tra trong cùng transaction để tránh race condition
            });

            // Nếu tìm thấy danh mục trùng lặp
            if (existingCategory) {
                // Hủy bỏ transaction vì không tạo mới
                await transaction.rollback();
                // Ném lỗi rõ ràng để thông báo cho người dùng/hệ thống
                const error = new Error('Danh mục đã tồn tại');
                error.statusCode = 409; // HTTP Status Code 409 Conflict thường dùng cho trường hợp này
                throw error;
            }
            // --- KẾT THÚC KIỂM TRA TRÙNG LẶP ---

            // --- Kiểm tra parent_id hợp lệ ---
            if (parentId) {
                const parentCategory = await Category.findByPk(parentId, { transaction });
                if (!parentCategory) {
                    const error = new Error('Danh mục cha không tồn tại');
                    error.statusCode = 404; // Not Found
                    throw error;
                }
            }

            // Nếu không trùng lặp, tiến hành tạo mới danh mục
            const category = await Category.create({
                name: categoryName,
                parent_id: parentId // Sử dụng parentId đã chuẩn hóa
            }, { transaction }); // Tạo trong transaction

            // Nếu tạo thành công, commit transaction
            await transaction.commit();
            return category;

        } catch (err) {
            // Nếu có bất kỳ lỗi nào xảy ra (kể cả lỗi trùng lặp đã throw ở trên), rollback transaction
            // Kiểm tra xem transaction có còn hoạt động không trước khi rollback
            if (transaction && !transaction.finished) {
                await transaction.rollback();
            }
            throw err;
        }
    }

    // ============================================
    // CẬP NHẬT DANH MỤC - updateCategory
    // ============================================
    /**
     * Update Category By ID
     * -----------------------------
     * @desc    Cập nhật danh mục theo ID
     * @param   {Number} id 
     * @param   {Object} data
     * @returns {Object} updated category
     */
    async updateCategory(id, data) {
        // Bắt đầu một transaction để đảm bảo tính toàn vẹn dữ liệu
        const transaction = await db.sequelize.transaction();
        try {
            // Chuẩn hóa parent_id: nếu không cung cấp hoặc là giá trị falsy (trừ 0 nếu 0 là ID hợp lệ), coi là null
            const parentId = data.parent_id || null;
            const categoryName = data.name;

            // Kiểm tra danh mục cần cập nhật có tồn tại không
            const category = await Category.findByPk(id, { transaction });
            if (!category) {
                const error = new Error('Không tìm thấy danh mục');
                error.statusCode = 404;
                throw error;
            }

            // Kiểm tra trùng lặp tên với các danh mục khác (loại trừ danh mục hiện tại)
            if (categoryName) {
                const existingCategory = await Category.findOne({
                    where: {
                        name: categoryName,
                        id: { [Op.ne]: id } // không phải danh mục hiện tại
                    },
                    transaction
                });

                if (existingCategory) {
                    await transaction.rollback();
                    const error = new Error('Tên danh mục đã tồn tại');
                    error.statusCode = 409;
                    throw error;
                }
            }

            // Kiểm tra parent_id hợp lệ
            if (parentId) {
                const parentCategory = await Category.findByPk(parentId, { transaction });
                if (!parentCategory) {
                    const error = new Error('Danh mục cha không tồn tại');
                    error.statusCode = 404;
                    throw error;
                }

                // Kiểm tra không thể đặt chính nó làm cha
                if (parentId === id) {
                    const error = new Error('Không thể đặt danh mục làm cha của chính nó');
                    error.statusCode = 400;
                    throw error;
                }
            }

            // Cập nhật danh mục
            await category.update(data, { transaction });

            // Commit transaction nếu thành công
            await transaction.commit();
            return category;
        } catch (err) {
            // Rollback transaction nếu có lỗi
            if (transaction && !transaction.finished) {
                await transaction.rollback();
            }
            throw err;
        }
    }

    // ============================================
    // XÓA DANH MỤC - deleteCategory
    // ============================================
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
                const error = new Error('Không tìm thấy danh mục');
                error.statusCode = 404;
                throw error;
            }
            await category.destroy();
        } catch (err) {
            throw err;
        }
    }
}

module.exports = new CategoryService();
