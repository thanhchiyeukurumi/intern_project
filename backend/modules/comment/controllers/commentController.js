const commentService = require('../services/commentService');
const { ok, created, notFound, error, customError } = require('../../../utils/responseUtils');

class CommentController {
  // ============================================
  // LẤY DANH SÁCH BÌNH LUẬN CỦA MỘT BÀI VIẾT - getCommentsByPostId
  // ============================================
  /**
   * GET /posts/:postId/comments
   * @desc    Lấy danh sách bình luận của một bài viết
   * @access  Public
   * @query   {number} page           - Trang hiện tại
   * @query   {number} limit          - Số bình luận trên mỗi trang
   * @query   {string} orderBy        - Trường sắp xếp
   * @query   {string} order          - Hướng sắp xếp
   */
  async getCommentsByPostId(req, res) {
    try {
      const postId = req.params.postId;
      const options = {
        page: req.query.page || 1,
        limit: req.query.limit || 10,
        orderBy: req.query.orderBy || 'created_at',
        order: req.query.order || 'DESC'
      };
      
      const result = await commentService.getCommentsByPostId(postId, options);
      return ok(res, result);
    } catch (err) {
      return error(res, err.message);
    }
  }

  // ============================================
  // LẤY THÔNG TIN CHI TIẾT BÌNH LUẬN - getCommentById
  // ============================================
  /**
   * GET /comments/:id
   * @desc    Lấy thông tin chi tiết bình luận
   * @access  Public?
   */
  async getCommentById(req, res) {
    try {
      const commentId = req.params.id;
      const comment = await commentService.getCommentById(commentId);
      return ok(res, comment);
    } catch (err) {
      if (err.message === 'Không tìm thấy bình luận') {
        return notFound(res, err.message);
      }
      return error(res, err.message);
    }
  }

  // ============================================
  // TẠO BÌNH LUẬN MỚI - createComment
  // ============================================
  /**
   * POST /posts/:postId/comments
   * @desc    Tạo bình luận mới
   * @access  User
   */
  async createComment(req, res) {
    try {
      const userId = req.user.id;
      const postId = req.params.postId;
      const comment = await commentService.createComment(req.body, userId, postId);
      return created(res, comment, 'Thêm bình luận thành công');
    } catch (err) {
      return error(res, err.message);
    }
  }

  // ============================================
  // CẬP NHẬT BÌNH LUẬN - updateComment
  // ============================================
  /**
   * PUT /comments/:id
   * @desc    Cập nhật bình luận
   * @access  Owner
   */
  async updateComment(req, res) {
    try {
      const commentId = req.params.id;
      const userId = req.user.id;
      
      const comment = await commentService.updateComment(commentId, req.body, userId);
      return ok(res, comment, 'Cập nhật bình luận thành công');
    } catch (err) {
      if (err.message.includes('Không tìm thấy bình luận')) {
        return notFound(res, err.message);
      }
      return error(res, err.message);
    }
  }

  // ============================================
  // XÓA BÌNH LUẬN - deleteComment
  // ============================================
  /**
   * DELETE /comments/:id
   * @desc    Xóa bình luận
   * @access  Owner, Admin
   */
  async deleteComment(req, res) {
    try {
      const commentId = req.params.id;
      const userId = req.user.id;
      const isAdmin = req.user.role?.name === 'admin';
      
      await commentService.deleteComment(commentId, userId, isAdmin);
      return ok(res, null, 'Xóa bình luận thành công');
    } catch (err) {
      if (err.message === 'Không tìm thấy bình luận') {
        return notFound(res, err.message);
      }
      if (err.message === 'Bạn không có quyền xóa bình luận này') {
        return customError(res, 403, err.message);
      }
      return error(res, err.message);
    }
  }

  // ============================================
  // LẤY DANH SÁCH BÌNH LUẬN CỦA NGƯỜI DÙNG - getCommentsByUserId
  // ============================================
  /** 
   * GET /users/:userId/comments
   * @desc    Lấy danh sách bình luận của người dùng
   * @access  Admin
   */
  async getCommentsByUserId(req, res) {
    try {
      let userId = req.params.userId;
      
      // Nếu không có userId trong params, sử dụng ID của người dùng đã xác thực
      if (!userId && req.user) {
        userId = req.user.id;
      }
      
      if (!userId) {
        return error(res, 'Thiếu ID người dùng', 400);
      }
      
      const options = {
        page: req.query.page || 1,
        limit: req.query.limit || 10,
        orderBy: req.query.orderBy || 'created_at',
        order: req.query.order || 'DESC'
      };
      
      const result = await commentService.getCommentsByUserId(userId, options);
      return ok(res, result);
    } catch (err) {
      return error(res, err.message);
    }
  }
}

module.exports = new CommentController(); 