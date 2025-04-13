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
                throw new Error('Người dùng không tồn tại');
            }
            return {
                data: user
            } 
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
        try {
            const existingUser = await User.findOne({
                where: {
                    username: data.username
                }
            });
            if (existingUser) {
                throw new Error('Tên tài khoản đã tồn tại');
            }
            const user = await User.create(data);
            return user;
        } catch (err) {
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
    async updateUser(id, data) {
        try {
            const user = await User.findByPk(id);
            if (!user) {
                throw new Error('Người dùng không tồn tại');
            }
            await user.update(data);
            return {
                data: user
            }
        } catch (err) {
            throw err;
        }
    }
    // TODO: Kiểm tra lúc cập nhật có bị trùng email và username khác trong db không

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
                throw new Error('Người dùng không tồn tại');    
            }
            await user.destroy();
        } catch (err) {
            throw err;
        }
    }   
}

module.exports = new UserService();
