const userService = require("../services/userService");
const { ok, created, error } = require('../../../utils/responseUtils');

class UserController { 
    /**
     * Lấy danh sách tất cả người dùng
     */
    async getAllUsers(req, res) {
        try {
            const users = await userService.getAllUsers();
            return ok(res, users);
        } catch (err) {
            return error(res, err.message);
        }
    }   

    /**
     * Lấy thông tin người dùng theo id
     */
    async getUserById(req, res) {
        try {   
            const user = await userService.getUserById(req.params.id);
            return ok(res, user);
        } catch (err) {
            return error(res, err.message);
        }
    }   

    /**
     * Tạo người dùng mới
     * @deprecated: Không sử dụng (Admin không tạo người dùng)
     */
    async createUser(req, res) {
        try {   
            const user = await userService.createUser(req.body);
            return created(res, user, 'Người dùng đã được tạo thành công');
        } catch (err) {
            return error(res, err.message);
        }
    }   

    /**
     * Cập nhật thông tin người dùng
     */
    async updateUser(req, res) {
        try {   
            const user = await userService.updateUser(req.params.id, req.body);
            return ok(res, user, 'Người dùng đã được cập nhật thành công');
        } catch (err) {
            return error(res, err.message);
        }
    }      

    /**
     * Xóa người dùng
     */
    async deleteUser(req, res) {
        try {   
            await userService.deleteUser(req.params.id);
            return ok(res, 'Người dùng đã được xóa thành công');
        } catch (err) {
            return error(res, err.message);
        }
    }      
}
    
module.exports = new UserController();
