const db = require('models');
const { Comment, User, Post, Sequelize } = db;
const { Op } = Sequelize;

class CommentService {
  /**
   * Lấy danh sách bình luận của một bài viết
   * @param {Number} postId - ID bài viết
   * @param {Object} options - Tùy chọn phân trang và sắp xếp
   * @returns {Object} - Danh sách bình luận và thông tin phân trang
   */
  async getCommentsByPostId(postId, options = {}) {
    try {
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
        throw new Error('Không tìm thấy bình luận');
      }
      
      return comment;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Tạo bình luận mới
   * @param {Object} data - Dữ liệu bình luận
   * @param {Number} userId - ID của người dùng tạo bình luận
   * @returns {Object} - Bình luận đã tạo
   */
  async createComment(data, userId, postId) {
    const transaction = await db.sequelize.transaction();
    
    try {
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
      await transaction.rollback();
      throw error;
    }
  }

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
      // Kiểm tra bình luận tồn tại và thuộc về người dùng
      const comment = await Comment.findOne({
        where: { id: commentId, user_id: userId }
      }, { transaction });
      
      if (!comment) {
        throw new Error('Không tìm thấy bình luận hoặc bạn không có quyền chỉnh sửa');
      }
      
      // Cập nhật bình luận
      await comment.update(data, { transaction });
      
      await transaction.commit();
      
      // Lấy thông tin đầy đủ của bình luận
      return this.getCommentById(commentId);
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  }

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
        throw new Error('Không tìm thấy bình luận');
      }
      
      // Kiểm tra quyền xóa (admin hoặc chủ sở hữu)
      if (!isAdmin && comment.user_id !== userId) {
        throw new Error('Bạn không có quyền xóa bình luận này');
      }
      
      // Xóa bình luận
      await comment.destroy({ transaction });
      
      await transaction.commit();
      return true;
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  }

  /**
   * Lấy danh sách bình luận của người dùng
   * @param {Number} userId - ID của người dùng
   * @param {Object} options - Tùy chọn phân trang
   * @returns {Object} - Danh sách bình luận
   */
  async getCommentsByUserId(userId, options = {}) {
    try {
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