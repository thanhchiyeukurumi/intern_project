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
      
      const page = parseInt(options.page, 10) || 1;
      const limit = parseInt(options.limit, 10) || 1;
      const orderBy = options.orderBy || 'created_at';
      const order = options.order || 'DESC';

      const offset = (page - 1) * limit;
      const where = {
        user_id: userId,
      };

      const queryOptions = {
        where,
        include: [
          {
            model: Post,
            attributes: ['id', 'title', 'slug']
          }
        ],
        order: [[orderBy, order]],
        limit,
        offset,
        distinct: true,
      }

      const { count, rows } = await Comment.findAndCountAll(queryOptions);
      return {
        data: rows,
        pagination: {
          total: count,
          page,
          limit,
          totalPages: Math.ceil(count / limit)
        }
      };
    } catch (error) {
      throw error;
    }
  }

  // ============================================
  // LẤY THỐNG KÊ BÌNH LUẬN THEO KHOẢNG THỜI GIAN - getCommentsByDateRange
  // ============================================
  /**
   * Lấy thống kê bình luận theo khoảng thời gian
   * @param {Object} options - Tùy chọn khoảng thời gian và lọc
   * @returns {Object} - Thống kê bình luận
   */
  async getCommentsByDateRange(options = {}) {
    try {
      const startDate = options.startDate ? new Date(options.startDate) : new Date(new Date().setDate(new Date().getDate() - 30));
      const endDate = options.endDate ? new Date(options.endDate) : new Date();
      const groupByInterval = options.groupBy || 'day'; // 'day', 'week', 'month'
      const postId = parseInt(options.postId, 10) || null;
      const userId = parseInt(options.userId, 10) || null;
      
      // Điều kiện WHERE cơ bản
      let whereClause = 'WHERE c.created_at BETWEEN :startDate AND :endDate';
      const replacements = { startDate, endDate };
      
      if (postId) {
        whereClause += ' AND c.post_id = :postId';
        replacements.postId = postId;
      }
      
      if (userId) {
        whereClause += ' AND c.user_id = :userId';
        replacements.userId = userId;
      }
      
      // Xác định trường group by dựa trên interval
      let dateFormat;
      switch (groupByInterval) {
        case 'week':
          dateFormat = "DATE_FORMAT(c.created_at, '%Y-%u')";
          break;
        case 'month':
          dateFormat = "DATE_FORMAT(c.created_at, '%Y-%m')";
          break;
        default: // day
          dateFormat = "DATE_FORMAT(c.created_at, '%Y-%m-%d')";
          break;
      }
      
      // Thực hiện truy vấn SQL trực tiếp
      const results = await db.sequelize.query(`
        SELECT ${dateFormat} as date, COUNT(c.id) as count
        FROM comments c
        ${whereClause}
        GROUP BY date
        ORDER BY date ASC
      `, {
        replacements,
        type: Sequelize.QueryTypes.SELECT
      });
      
      // Tính tổng số bình luận trong khoảng thời gian
      const whereOptions = {
        createdAt: {
          [Op.between]: [startDate, endDate]
        }
      };
      
      if (postId) whereOptions.post_id = postId;
      if (userId) whereOptions.user_id = userId;
      
      const totalCount = await Comment.count({ where: whereOptions });
      
      // Định dạng kết quả thống kê
      const stats = [];
      let currentDate = new Date(startDate);
      
      while (currentDate <= endDate) {
        let dateKey;
        switch (groupByInterval) {
          case 'week':
            const weekNum = getWeekNumber(currentDate);
            dateKey = `${currentDate.getFullYear()}-${weekNum < 10 ? '0' + weekNum : weekNum}`;
            // Tăng lên 7 ngày cho tuần kế tiếp
            currentDate = new Date(currentDate.getTime() + 7 * 24 * 60 * 60 * 1000);
            break;
          case 'month':
            dateKey = `${currentDate.getFullYear()}-${(currentDate.getMonth() + 1).toString().padStart(2, '0')}`;
            // Tăng lên 1 tháng
            currentDate.setMonth(currentDate.getMonth() + 1);
            break;
          default: // day
            dateKey = currentDate.toISOString().split('T')[0];
            // Tăng lên 1 ngày
            currentDate = new Date(currentDate.getTime() + 24 * 60 * 60 * 1000);
            break;
        }
        
        const result = results.find(r => r.date === dateKey);
        stats.push({
          date: dateKey,
          count: result ? parseInt(result.count) : 0
        });
      }
      
      return {
        stats,
        total: totalCount
      };
    } catch (error) {
      console.error('Error in getCommentsByDateRange:', error);
      throw error;
    }
  }

  // ============================================
  // LẤY THỐNG KÊ BÌNH LUẬN - getCommentStats
  // ============================================
  /**
   * Lấy thống kê tổng hợp về bình luận
   * @param {Object} options - Tùy chọn khoảng thời gian và lọc
   * @returns {Object} - Thống kê tổng hợp về bình luận
   */
  async getCommentStats(options = {}) {
    try {
      const startDate = options.startDate ? new Date(options.startDate) : new Date(new Date().setDate(new Date().getDate() - 30));
      const endDate = options.endDate ? new Date(options.endDate) : new Date();
      
      // Lấy thống kê bình luận theo thời gian
      const commentStats = await this.getCommentsByDateRange(options);
      
      // Thống kê bình luận theo bài viết (top 5 bài viết có nhiều bình luận nhất)
      const postDistribution = await db.sequelize.query(`
        SELECT p.id, p.title, COUNT(c.id) as count
        FROM posts p
        JOIN comments c ON p.id = c.post_id
        WHERE c.created_at BETWEEN :startDate AND :endDate
        GROUP BY p.id, p.title
        ORDER BY count DESC
        LIMIT 5
      `, {
        replacements: { startDate, endDate },
        type: Sequelize.QueryTypes.SELECT
      });
      
      // Thống kê bình luận theo người dùng (top 5 người dùng bình luận nhiều nhất)
      const userDistribution = await db.sequelize.query(`
        SELECT u.id, u.username, u.avatar, COUNT(c.id) as count
        FROM users u
        JOIN comments c ON u.id = c.user_id
        WHERE c.created_at BETWEEN :startDate AND :endDate
        GROUP BY u.id, u.username, u.avatar
        ORDER BY count DESC
        LIMIT 5
      `, {
        replacements: { startDate, endDate },
        type: Sequelize.QueryTypes.SELECT
      });
      
      // Tính toán tăng trưởng so với khoảng thời gian trước đó
      const timeRange = endDate.getTime() - startDate.getTime();
      const previousStartDate = new Date(startDate.getTime() - timeRange);
      
      // Tính số bình luận trong khoảng thời gian trước đó
      const previousCommentsCount = await Comment.count({
        where: {
          createdAt: {
            [Op.between]: [previousStartDate, startDate]
          }
        }
      });
      
      // Tính tỷ lệ tăng trưởng
      const growth = previousCommentsCount > 0 
        ? ((commentStats.total - previousCommentsCount) / previousCommentsCount) * 100 
        : 100;
      
      return {
        total: commentStats.total,
        growth: parseFloat(growth.toFixed(2)),
        timeData: commentStats.stats,
        posts: postDistribution,
        users: userDistribution
      };
    } catch (error) {
      console.error('Error in getCommentStats:', error);
      throw error;
    }
  }
}

// Hàm helper để lấy số tuần trong năm
function getWeekNumber(date) {
  const firstDayOfYear = new Date(date.getFullYear(), 0, 1);
  const pastDaysOfYear = (date - firstDayOfYear) / 86400000;
  return Math.ceil((pastDaysOfYear + firstDayOfYear.getDay() + 1) / 7);
}

module.exports = new CommentService(); 