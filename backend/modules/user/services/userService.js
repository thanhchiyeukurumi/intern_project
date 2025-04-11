const db = require('models');
const {User} = db;

class UserService {
    /**
     * Lấy danh sách tất cả người dùng
     */
    async getAllUsers() {
        try {
            const users = await User.findAll({
                attributes: {
                    exclude: ['password']
                }
            });
            return users;
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
