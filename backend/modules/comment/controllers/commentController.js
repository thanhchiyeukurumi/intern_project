const commentService = require('../services/commentService');
const { ok, created, notFound, error, customError, conflict } = require('../../../utils/responseUtils');

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
      if (err.statusCode == 404) { return notFound(res, err.message); }
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
      if (err.statusCode == 404) { return notFound(res, err.message); }
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
      return created(res, comment);
    } catch (err) {
      if (err.statusCode == 404) { return notFound(res, err.message); }
      else if (err.statusCode == 409) { return conflict(res, err.message); }
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
      return ok(res, comment);
    } catch (err) {
      if (err.statusCode == 404 || err.message.includes('Không tìm thấy bình luận')) {
        return notFound(res, err.message);
      }
      else if (err.statusCode == 409) { return conflict(res, err.message); }
      else if (err.statusCode == 403) { return customError(res, 403, err.message); }
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
      return ok(res, null);
    } catch (err) {
      if (err.statusCode == 404) { return notFound(res, err.message); }
      if (err.statusCode == 403) { return customError(res, 403, err.message); }
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
        return customError(res, 400, 'Thiếu ID người dùng');
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
      if (err.statusCode == 404) { return notFound(res, err.message); }
      return error(res, err.message);
    }
  }

  //comments get /me
  async getMyComments(req, res) {
    try {
      const userId = req.user.id;
  
      const options = {
        page: req.query.page || 1,
        limit: req.query.limit || 10,
        orderBy: req.query.orderBy || 'created_at',
        order: req.query.order || 'DESC'
      };
  
      const result = await commentService.getCommentsByUserId(userId, options);
      return ok(res, result);
    } catch (err) {
      if (err.statusCode == 404) return notFound(res, err.message);
      return error(res, err.message);
    }
  }

  // ============================================
  // LẤY THỐNG KÊ BÌNH LUẬN THEO KHOẢNG THỜI GIAN - getCommentsByDateRange
  // ============================================
  /**
   * GET /comments/stats/date-range
   * @desc    Lấy thống kê bình luận theo khoảng thời gian
   * @access  Admin
   */
  async getCommentsByDateRange(req, res) {
    try {
      const options = {
        startDate: req.query.startDate || null,
        endDate: req.query.endDate || null,
        groupBy: req.query.groupBy || 'day',
        postId: req.query.postId || null,
        userId: req.query.userId || null
      };
      
      const result = await commentService.getCommentsByDateRange(options);
      return ok(res, result);
    } catch (err) {
      console.error('Error in getCommentsByDateRange controller:', err);
      return error(res, err.message);
    }
  }

  // ============================================
  // LẤY THỐNG KÊ BÌNH LUẬN - getCommentStats
  // ============================================
  /**
   * GET /comments/stats/dashboard
   * @desc    Lấy thống kê tổng hợp về bình luận
   * @access  Admin
   */
  async getCommentStats(req, res) {
    try {
      const options = {
        startDate: req.query.startDate || null,
        endDate: req.query.endDate || null,
        groupBy: req.query.groupBy || 'day',
        postId: req.query.postId || null,
        userId: req.query.userId || null
      };
      
      const result = await commentService.getCommentStats(options);
      return ok(res, result);
    } catch (err) {
      console.error('Error in getCommentStats controller:', err);
      return error(res, err.message);
    }
  }
}

module.exports = new CommentController(); 