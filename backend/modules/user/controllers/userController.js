const userService = require("../services/userService");
const { ok, created, error, notFound, conflict, forbidden } = require('../../../utils/responseUtils');

class UserController { 
    // ============================================
    // LẤY DANH SÁCH NGƯỜI DÙNG - getAllUsers
    // ============================================
    /**
     * GET /users
     * @desc    Lấy danh sách tất cả người dùng
     * @access  Admin
     * @query   {number} page           - Trang hiện tại
     * @query   {number} limit          - Số người dùng trên mỗi trang
     * @query   {string} search         - Từ khóa tìm kiếm
     * @query   {string} orderBy        - Trường sắp xếp
     * @query   {string} order          - Hướng sắp xếp
     */
    async getAllUsers(req, res) {
        try {
            const options = {
                page: req.query.page || 1,
                limit: req.query.limit || 10,
                search: req.query.search,
                orderBy: req.query.orderBy || 'createdAt',
                order: req.query.order || 'DESC',
                includeRelations: req.query.includeRelations || false
              };

            const result = await userService.getAllUsers(options);
            return ok(res, result);
        } catch (err) {
            return error(res, err.message);
        }
    }   

    // ============================================
    // LẤY THÔNG TIN NGƯỜI DÙNG THEO ID - getUserById
    // ============================================
    /**
     * GET /users/:id
     * @desc    Lấy thông tin người dùng theo id
     * @access  Admin
     */
    async getUserById(req, res) {
        try {   
            const user = await userService.getUserById(req.params.id);
            return ok(res, user);
        } catch (err) {
            if (err.statusCode == 404) { return notFound(res, err.message); }
            return error(res, err.message);
        }
    }   

    // ============================================
    // TẠO NGƯỜI DÙNG MỚI - createUser
    // ============================================
    /**
     * POST /users
     * @desc    Tạo người dùng mới
     * @access  Admin
     */
    async createUser(req, res) {
        try {   
            const user = await userService.createUser(req.body);
            return created(res, user);
        } catch (err) {
            if (err.statusCode == 409) { return conflict(res, err.message); }   
            return error(res, err.message);
        }
    }   

    // ============================================
    // CẬP NHẬT THÔNG TIN NGƯỜI DÙNG - updateUser
    // ============================================
    /**
     * PUT /users/:id
     * @desc    Cập nhật thông tin người dùng
     * @access  Owner
     */
    async updateUser(req, res) {
        try {   
            // console.log(req.user); -.>>>> debug
            const user = await userService.updateUser(req.params.id, req.body, req.user.role_id);
            return ok(res, user, 'Người dùng đã được cập nhật thành công');
        } catch (err) {
            if (err.statusCode == 404) { return notFound(res, err.message); }
            if (err.statusCode == 409) { return conflict(res, err.message); }
            if (err.statusCode == 403) { return forbidden(res, err.message); }
            return error(res, err.message);
        }
    }      

    // ============================================
    // XÓA NGƯỜI DÙNG - deleteUser
    // ============================================
    /**
     * DELETE /users/:id
     * @desc    Xóa người dùng
     * @access  Admin
     */
    async deleteUser(req, res) {
        try {   
            await userService.deleteUser(req.params.id);
            return ok(res, 'Người dùng đã được xóa thành công');
        } catch (err) {
            if (err.statusCode == 404) { return notFound(res, err.message); }
            return error(res, err.message);
        }
    }      
}
    
module.exports = new UserController();
