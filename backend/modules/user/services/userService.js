const db = require('models');
const {User} = db;

class UserService {
    /**
     * Lấy danh sách tất cả người dùng
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
                    { username: { [Op.like]: `%${search}%` } },
                    { email: { [Op.like]: `%${search}%` } }
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
                    page: parseInt(page),
                    limit: parseInt(limit),
                    totalPages: Math.ceil(count / limit)
                }
            };  
        } catch (err) {
            throw err;
        }
    }   

    /**
     * Lấy thông tin người dùng theo id
     */
    async getUserById(id) { 
        try {
            const user = await User.findByPk(id, {
                attributes: {
                    exclude: ['password']
                }
            });
            return user;
        } catch (err) {
            throw err;
        }
    }

    /**
     * Tạo người dùng mới
     * @deprecated: Không sử dụng (Admin không tạo người dùng)
     */
    async createUser(data) {    
        try {
            const user = await User.create(data);
            return user;
        } catch (err) {
            throw err;
        }
    }

    /**
     * Cập nhật thông tin người dùng
     */
    async updateUser(id, data) {
        try {
            const user = await User.findByPk(id, {
                attributes: {
                    exclude: ['password']
                }
            });
            if (!user) {
                throw new Error('Người dùng không tồn tại');
            }
            await user.update(data);
            return user;
        } catch (err) {
            throw err;
        }
    }

    /**
     * Xóa người dùng
     */ 
    async deleteUser(id) {
        try {
            const user = await User.findByPk(id);
            if (!user) {
                throw new Error('Người dùng không tồn tại');    
            }
            await user.destroy();
            return user;
        } catch (err) {
            throw err;
        }
    }   
}

module.exports = new UserService();
