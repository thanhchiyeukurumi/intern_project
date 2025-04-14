const db = require('models');
const {User} = db;
const { Op } = require('sequelize');

class UserService {
    // ============================================
    // LẤY DANH SÁCH NGƯỜI DÙNG - getAllUsers
    // ============================================
    /**
     * @desc: Lấy danh sách tất cả người dùng (có phân trang, tìm kiếm, sắp xếp)
     * @param {Object} options - { page, limit, search, orderBy, order }
     * @returns {Object} { data: [...], pagination: { total, page, limit } }
     */
    async getAllUsers(options = {}) {
        try {
            const page = parseInt(options.page, 10) || 1;
            const limit = parseInt(options.limit, 10) || 10;
            const search = options.search || null;
            const orderBy = options.orderBy || 'createdAt';
            const order = options.order || 'DESC';
            const includeRelations = options.includeRelations || false;
            
            const offset = (page - 1) * limit;
            const where = {};

            if (search) {
                where[Op.or] = [
                    { username: { [Op.like]: `%${search}%` } }
                ]; 
            }

            const queryOptions = {
                where,
                order: [[orderBy, order]],
                offset,
                limit,
                attributes: { exclude: ['password', 'createdAt', 'updatedAt'] }
            };

            const { count, rows } = await User.findAndCountAll(queryOptions);   
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
    // LẤY THÔNG TIN NGƯỜI DÙNG THEO ID - getUserById
    // ============================================
    /**
     * @desc: Lấy thông tin người dùng theo id
     * @param {number} id - id của người dùng
     * @returns {Object} { data: user }
     */
    async getUserById(id) { 
        try {
            const user = await User.findByPk(id, {
                attributes: { exclude: ['password'] }
            });
            if (!user) {
                const error = new Error('Người dùng không tồn tại');
                error.statusCode = 404;
                throw error;
            }
            return user; 
        } catch (err) {
            throw err;
        }
    }

    // ============================================
    // TẠO NGƯỜI DÙNG MỚI - createUser
    // ============================================
    /**
     * @deprecated: Không sử dụng (Admin không tạo người dùng)
     * @param {Object} data - Dữ liệu người dùng
     * @returns {Object} { data: user }
     */
    async createUser(data) {    
        const transaction = await db.sequelize.transaction();
        try {
            const existingUser = await User.findOne({
                where: {
                    username: data.username
                },
                transaction
            });
            if (existingUser) {
                await transaction.rollback();
                const error = new Error('Tên tài khoản đã tồn tại');
                error.statusCode = 409;
                throw error;
            }
            const user = await User.create(data, { transaction });
            await transaction.commit();
            return user;
        } catch (err) {
            if (transaction && !transaction.finished) {
                await transaction.rollback();
            }
            throw err;
        }
    }

    // ============================================
    // CẬP NHẬT THÔNG TIN NGƯỜI DÙNG - updateUser
    // ============================================
    /**
     * @param {number} id - id của người dùng
     * @param {Object} data - Dữ liệu người dùng
     * @returns {Object} { data: user }
     */
    async updateUser(id, data, role) {
        const transaction = await db.sequelize.transaction();
        try {
            const user = await User.findByPk(id, { transaction });
            if (!user) {
                await transaction.rollback();
                const error = new Error('Người dùng không tồn tại');
                error.statusCode = 404;
                throw error;
            }
            
            // 2. Kiểm tra quyền thay đổi role
            if (data.role_id && role != 1) {
                await transaction.rollback();
                const error = new Error('Bạn không có quyền thay đổi vai trò người dùng');
                error.statusCode = 403;
                throw error;
            }

            // Kiểm tra xem username hoặc email có bị thay đổi không
            const usernameChanged = data.username && data.username !== user.username;
            const emailChanged = data.email && data.email !== user.email;
            
            // Chỉ kiểm tra trùng lặp nếu có thay đổi
            if (usernameChanged || emailChanged) {
                const whereConditions = [];
                
                if (usernameChanged) {
                    whereConditions.push({
                        username: data.username,
                        id: { [Op.ne]: id } // Loại trừ user hiện tại
                    });
                }
                
                if (emailChanged) {
                    whereConditions.push({
                        email: data.email,
                        id: { [Op.ne]: id } // Loại trừ user hiện tại
                    });
                }
                               
                // Kiểm tra xem có user nào khác sử dụng username hoặc email này không
                if (whereConditions.length > 0) {
                    const existingUser = await User.findOne({
                        where: { [Op.or]: whereConditions },
                        transaction
                    });
                    
                    if (existingUser) {
                        await transaction.rollback();
                        const error = new Error(
                            existingUser.username === data.username 
                            ? 'Tên tài khoản đã tồn tại' 
                            : 'Email đã tồn tại'
                        );
                        error.statusCode = 409;
                        throw error;
                    }
                }
            }
            
            await user.update(data, { transaction });
            await transaction.commit();
            return user;
        } catch (err) {
            if (transaction && !transaction.finished) {
                await transaction.rollback();
            }   
            throw err;
        }
    }

    // ============================================
    // XÓA NGƯỜI DÙNG - deleteUser
    // ============================================
    /**
     * @param {number} id - id của người dùng
     * @returns {Object} { data: user }
     */ 
    async deleteUser(id) {
        try {
            const user = await User.findByPk(id);
            if (!user) {
                const error = new Error('Người dùng không tồn tại');
                error.statusCode = 404;
                throw error;
            }
            await user.destroy();
        } catch (err) {
            throw err;
        }
    }   
}

module.exports = new UserService();
