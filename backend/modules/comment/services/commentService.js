const db = require('models');
const { Comment, User, Post, Sequelize } = db;
const { Op } = Sequelize;

class CommentService {
  // ============================================
  // LẤY DANH SÁCH BÌNH LUẬN CỦA MỘT BÀI VIẾT - getCommentsByPostId
  // ============================================
  /**
   * Lấy danh sách bình luận của một bài viết
   * @param {Number} postId - ID bài viết
   * @param {Object} options - Tùy chọn phân trang và sắp xếp
   * @returns {Object} - Danh sách bình luận và thông tin phân trang
   */
  async getCommentsByPostId(postId, options = {}) {
    try {
      // Kiểm tra post có tồn tại không
      const post = await Post.findByPk(postId);
      if (!post) {
        const error = new Error('Không tìm thấy bài viết');
        error.statusCode = 404;
        throw error;
      }
      
      const {
        page = 1,
        limit = 10,
        orderBy = 'created_at',
        order = 'DESC'
      } = options;

      const offset = (page - 1) * limit;
      
      const { count, rows } = await Comment.findAndCountAll({
        where: { post_id: postId },
        include: [
          {
            model: User,
            attributes: ['id', 'username', 'email', 'avatar']
          }
        ],
        order: [[orderBy, order]],
        limit,
        offset
      });
      
      return {
        data: rows,
        pagination: {
          total: count,
          page: parseInt(page),
          limit: parseInt(limit),
          totalPages: Math.ceil(count / limit)
        }
      };
    } catch (error) {
      throw error;
    }
  }

  // ============================================
  // LẤY THÔNG TIN CHI TIẾT BÌNH LUẬN - getCommentById
  // ============================================
  /**
   * Lấy thông tin chi tiết bình luận
   * @param {Number} commentId - ID bình luận
   * @returns {Object} - Thông tin chi tiết bình luận
   */
  async getCommentById(commentId) {
    try {
      const comment = await Comment.findByPk(commentId, {
        include: [
          {
            model: User,
            attributes: ['id', 'username', 'email', 'avatar']
          },
          {
            model: Post,
            attributes: ['id', 'title', 'slug']
          }
        ]
      });
      
      if (!comment) {
        const error = new Error('Không tìm thấy bình luận');
        error.statusCode = 404;
        throw error;
      }
      
      return comment;
    } catch (error) {
      throw error;
    }
  }

  // ============================================
  // TẠO BÌNH LUẬN MỚI - createComment
  // ============================================
  /**
   * Tạo bình luận mới
   * @param {Object} data - Dữ liệu bình luận
   * @param {Number} userId - ID của người dùng tạo bình luận
   * @returns {Object} - Bình luận đã tạo
   */
  async createComment(data, userId, postId) {
    const transaction = await db.sequelize.transaction();
    
    try {
      // Kiểm tra post có tồn tại không
      const post = await Post.findByPk(postId, { transaction });
      if (!post) {
        await transaction.rollback();
        const error = new Error('Không tìm thấy bài viết');
        error.statusCode = 404;
        throw error;
      }
      
      // Tạo bình luận mới
      const commentData = {
        ...data,
        user_id: userId,
        post_id: postId
      };
      
      const comment = await Comment.create(commentData, { transaction });
      
      await transaction.commit();
      
      // Lấy thông tin đầy đủ của bình luận
      return this.getCommentById(comment.id);
    } catch (error) {
      if (transaction && !transaction.finished) {
        await transaction.rollback();
      }
      throw error;
    }
  }

  // ============================================
  // CẬP NHẬT BÌNH LUẬN - updateComment
  // ============================================
  /**
   * Cập nhật bình luận
   * @param {Number} commentId - ID của bình luận
   * @param {Object} data - Dữ liệu cập nhật
   * @param {Number} userId - ID của người dùng cập nhật bình luận
   * @returns {Object} - Bình luận đã cập nhật
   */
  async updateComment(commentId, data, userId) {
    const transaction = await db.sequelize.transaction();
    
    try {
      // Kiểm tra bình luận tồn tại không
      const comment = await Comment.findByPk(commentId, { transaction });
      if (!comment) {
        await transaction.rollback();
        const error = new Error('Không tìm thấy bình luận');
        error.statusCode = 404;
        throw error;
      }
      
      // Kiểm tra người dùng có quyền cập nhật không
      if (comment.user_id !== userId) {
        await transaction.rollback();
        const error = new Error('Bạn không có quyền chỉnh sửa bình luận này');
        error.statusCode = 403;
        throw error;
      }
      
      // Cập nhật bình luận
      await comment.update(data, { transaction });
      
      await transaction.commit();
      
      // Lấy thông tin đầy đủ của bình luận
      return this.getCommentById(commentId);
    } catch (error) {
      if (transaction && !transaction.finished) {
        await transaction.rollback();
      }
      throw error;
    }
  }

  // ============================================
  // XÓA BÌNH LUẬN - deleteComment
  // ============================================
  /**
   * Xóa bình luận
   * @param {Number} commentId - ID của bình luận
   * @param {Number} userId - ID của người dùng xóa bình luận
   * @param {Boolean} isAdmin - Người dùng có phải là admin không
   * @returns {Boolean} - Kết quả xóa
   */
  async deleteComment(commentId, userId, isAdmin = false) {
    const transaction = await db.sequelize.transaction();
    
    try {
      // Tìm bình luận
      const comment = await Comment.findByPk(commentId, { transaction });
      
      if (!comment) {
        await transaction.rollback();
        const error = new Error('Không tìm thấy bình luận');
        error.statusCode = 404;
        throw error;
      }
      
      // Kiểm tra quyền xóa (admin hoặc chủ sở hữu)
      if (!isAdmin && comment.user_id !== userId) {
        await transaction.rollback();
        const error = new Error('Bạn không có quyền xóa bình luận này');
        error.statusCode = 403;
        throw error;
      }
      
      // Xóa bình luận
      await comment.destroy({ transaction });
      
      await transaction.commit();
      return true;
    } catch (error) {
      if (transaction && !transaction.finished) {
        await transaction.rollback();
      }
      throw error;
    }
  }

  // ============================================
  // LẤY DANH SÁCH BÌNH LUẬN CỦA NGƯỜI DÙNG - getCommentsByUserId
  // ============================================
  /**
   * Lấy danh sách bình luận của người dùng
   * @param {Number} userId - ID của người dùng
   * @param {Object} options - Tùy chọn phân trang
   * @returns {Object} - Danh sách bình luận
   */
  async getCommentsByUserId(userId, options = {}) {
    try {
      // Kiểm tra user có tồn tại không
      const user = await User.findByPk(userId);
      if (!user) {
        const error = new Error('Không tìm thấy người dùng');
        error.statusCode = 404;
        throw error;
      }
      
      const {
        page = 1,
        limit = 10,
        orderBy = 'created_at',
        order = 'DESC'
      } = options;

      const offset = (page - 1) * limit;
      
      const { count, rows } = await Comment.findAndCountAll({
        where: { user_id: userId },
        include: [
          {
            model: Post,
            attributes: ['id', 'title', 'slug']
          }
        ],
        order: [[orderBy, order]],
        limit,
        offset
      });
      
      return {
        data: rows,
        pagination: {
          total: count,
          page: parseInt(page),
          limit: parseInt(limit),
          totalPages: Math.ceil(count / limit)
        }
      };
    } catch (error) {
      throw error;
    }
  }
}

module.exports = new CommentService(); 