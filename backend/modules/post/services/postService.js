const db = require('models');
const { Post, Category, User, PostCategory, Language, Comment, Sequelize } = db;
const { Op } = Sequelize;

class PostService {
  // ============================================
  // LẤY DANH SÁCH BÀI VIẾT - getAllPosts
  // ============================================
  /**
   * Lấy danh sách bài viết với phân trang và lọc
   * @param {Object} options - Các tùy chọn để lọc và phân trang
   * @returns {Object} - Danh sách bài viết và thông tin phân trang
   */
  async getAllPosts(options = {}) {
    try {
      const page = parseInt(options.page, 10) || 1;
      const limit = parseInt(options.limit, 10) || 10;
      const categoryId = parseInt(options.categoryId, 10) || null;
      const search = options.search || null;
      const languageId = parseInt(options.languageId, 10) || null;
      const userId = parseInt(options.userId, 10) || null;
      const includeRelations = options.includeRelations || true;
      const orderBy = options.orderBy || 'createdAt';
      const order = options.order || 'DESC';
      const originalPost = options.originalPost || false;
      const fromOriginalPostId = parseInt(options.fromOriginalPostId, 10) || null;
      
      // Tinh toan offset: so luong bai viet can bo qua
      const offset = (page - 1) * limit;
      const where = {};
      
      // Tìm kiếm theo từ khóa
      if (search) {
        where[Op.or] = [
          { title: { [Op.like]: `%${search}%` } },
          { description: { [Op.like]: `%${search}%` } }
        ];
      }
      
      // Lọc theo ngôn ngữ
      if (languageId) {
        where.language_id = languageId;
      }
      
      // Lọc theo người dùng
      if (userId) {
        where.user_id = userId;
      }
      
      if (originalPost) { // Nếu yêu cầu chỉ lấy bài gốc
        where.original_post_id = null;
      } else if (fromOriginalPostId) { // Nếu yêu cầu lấy các bài từ một bài gốc cụ thể
        where.original_post_id = fromOriginalPostId;
      }

      // Xây dựng queryOptions cơ bản
      const queryOptions = {
        where,
        order: [[orderBy, order]],
        limit,
        offset,
        distinct: true
      };
      
      // Chuẩn bị mảng include với relations phù hợp
      let includes = [];
      
      // Nếu bao gồm relationships, thêm các mối quan hệ cơ bản
      if (includeRelations) {
        includes = [
          {
            model: User,
            attributes: ['id', 'username', 'email', 'avatar']
          },
          {
            model: Language,
            attributes: ['id', 'name', 'locale']
          },
          {
            model: Category,
            attributes: ['id', 'name'],
            through: { attributes: [] }
          }
        ];
      }
      
      // Nếu có categoryId, luôn thêm Category vào include để lọc
      if (categoryId) {
        // Nếu đã bao gồm Category trong includes
        const existingCategoryInclude = includes.find(inc => inc.model === Category);
        
        if (existingCategoryInclude) {
          // Cập nhật include hiện có
          existingCategoryInclude.where = { id: categoryId };
        } else {
          // Thêm mới include cho Category
          includes.push({
            model: Category,
            attributes: ['id', 'name'],
            where: { id: categoryId },
            through: { attributes: [] }
          });
        }
      }
      
      // Gắn include vào queryOptions nếu có include
      if (includes.length > 0) {
        queryOptions.include = includes;
      }
      
      // Thực hiện truy vấn
      const { count, rows } = await Post.findAndCountAll(queryOptions);
      
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
  // LẤY THÔNG TIN CHI TIẾT BÀI VIẾT - getPostByIdOrSlug
  // ============================================
  /**
   * Lấy thông tin chi tiết bài viết
   * @param {Number|String} identifier - ID hoặc slug của bài viết
   * @param {Boolean} incrementViews - Có tăng lượt xem không
   * @returns {Object} - Thông tin chi tiết bài viết
   */
  async getPostByIdOrSlug(identifier, incrementViews = false) {
    try {
      const isNumber = !isNaN(identifier);
      const where = isNumber ? { id: identifier } : { slug: identifier };
      
      const post = await Post.findOne({
        where,
        include: [
          {
            model: User,
            attributes: ['id', 'username', 'email', 'avatar']
          },
          {
            model: Language,
            attributes: ['id', 'name', 'locale']
          },
          {
            model: Category,
            attributes: ['id', 'name'],
            through: { attributes: [] }
          },
          {
            model: Comment,
            include: [
              {
                model: User,
                attributes: ['id', 'username', 'avatar']
              }
            ]
          }
        ]
      });
      
      if (!post) {
        const error = new Error('Không tìm thấy bài viết');
        error.statusCode = 404;
        throw error;
      }
      
      // Tăng lượt xem nếu được yêu cầu
      if (incrementViews) {
        await post.increment('views', { by: 1 });
        post.views += 1;
      }
      
      return post;
    } catch (error) {
      throw error;
    }
  }

  // ============================================
  // TẠO BÀI VIẾT MỚI - createPost
  // ============================================
  /**
   * Tạo bài viết mới
   * @param {Object} data - Dữ liệu bài viết
   * @param {Number} userId - ID của người dùng tạo bài viết
   * @returns {Object} - Bài viết đã tạo
   */
  async createPost(data, userId) {
    const transaction = await db.sequelize.transaction();
    
    try {
      // Tạo bài viết mới
      const { categories, ...postData } = data;
      postData.user_id = userId;
      
      const existingPost = await Post.findOne({ where: { title: postData.title }, transaction });
      if (existingPost) {
        await transaction.rollback();
        const error = new Error('Tiêu đề đã tồn tại');
        error.statusCode = 409;
        throw error;
      }
      const categoryExists  = await Category.findAll({
        where: { id: categories },
        transaction
      });
      if (categoryExists.length !== categories.length) {
        await transaction.rollback();
        const error = new Error('Một hoặc nhiều danh mục không tồn tại');
        error.statusCode = 404;
        throw error;
      }
      const post = await Post.create(postData, { transaction });
      
      // Thêm các danh mục cho bài viết
      if (categories && categories.length > 0) {
        const categoryEntries = categories.map(categoryId => ({
          post_id: post.id,
          category_id: categoryId
        }));
        
        await PostCategory.bulkCreate(categoryEntries, { transaction });
      }
      
      await transaction.commit();
      
      // Lấy thông tin đầy đủ của bài viết
      return this.getPostByIdOrSlug(post.id);
    } catch (error) {
      if (transaction && !transaction.finished) {
        await transaction.rollback();
      }
      throw error;
    }
  }

  // ============================================
  // CẬP NHẬT BÀI VIẾT - updatePost
  // ============================================
  /**
   * Cập nhật bài viết
   * @param {Number} id - ID của bài viết
   * @param {Object} data - Dữ liệu cập nhật
   * @param {Number} userId - ID của người dùng cập nhật bài viết
   * @returns {Object} - Bài viết đã cập nhật
   */
  async updatePost(id, data) {
    const transaction = await db.sequelize.transaction();
    
    try {
      // Kiểm tra bài viết tồn tại và thuộc về người dùng
      const post = await Post.findOne({
        where: { id }
      }, { transaction });
      
      if (!post) {
        await transaction.rollback();
        const error = new Error('Không tìm thấy bài viết');
        error.statusCode = 404;
        throw error;
      }
      
      // Cập nhật thông tin bài viết
      const { categories, ...postData } = data;
      await post.update(postData, { transaction });
      
      // Cập nhật danh mục nếu có
      if (categories) {
        // Xóa tất cả danh mục hiện tại
        await PostCategory.destroy({
          where: { post_id: id },
          transaction
        });
        
        // Thêm danh mục mới
        if (categories.length > 0) {
          const categoryEntries = categories.map(categoryId => ({
            post_id: id,
            category_id: categoryId
          }));
          
          await PostCategory.bulkCreate(categoryEntries, { transaction });
        }
      }
      
      await transaction.commit();
      
      // Lấy thông tin đầy đủ của bài viết
      return this.getPostByIdOrSlug(id);
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  }

  // ============================================
  // XÓA BÀI VIẾT - deletePost
  // ============================================
  /**
   * Xóa bài viết
   * @param {Number} id - ID của bài viết
   * @returns {Boolean} - Kết quả xóa
   */
  async deletePost(id) {
    const transaction = await db.sequelize.transaction();
    
    try {
      // Kiểm tra bài viết tồn tại và thuộc về người dùng
      const post = await Post.findOne({
        where: { id }
      }, { transaction });
      
      if (!post) {
        throw new Error('Không tìm thấy bài viết');
      }
      
      // Xóa bài viết
      await post.destroy({ transaction });
      
      await transaction.commit();
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  }

  // ============================================
  // LẤY DANH SÁCH BÀI VIẾT THEO DANH MỤC - getPostsByCategory
  // ============================================
  /**
   * Lấy bài viết theo danh mục
   * @param {Number} categoryId - ID của danh mục
   * @param {Object} options - Tùy chọn phân trang
   * @returns {Object} - Danh sách bài viết
   */
  async getPostsByCategory(categoryId, options = {}) {
    try {
      const withCategoryId = { ...options, categoryId };
      return this.getAllPosts(withCategoryId);
    } catch (error) {
      throw error;
    }
  }

  // ============================================
  // LẤY DANH SÁCH BÀI VIẾT THEO NGƯỜI DÙNG - getPostsByUser
  // ============================================
  /**
   * Lấy bài viết của người dùng
   * @param {Number} userId - ID của người dùng
   * @param {Object} options - Tùy chọn phân trang
   * @returns {Object} - Danh sách bài viết
   */
  async getPostsByUser(userId, options = {}) {
    try {
      const withUserId = { ...options, userId };
      return this.getAllPosts(withUserId);
    } catch (error) {
      throw error;
    }
  }

  // ============================================
  // LẤY THỐNG KÊ BÀI VIẾT THEO KHOẢNG THỜI GIAN - getPostsByDateRange
  // ============================================
  /**
   * Lấy thống kê bài viết theo khoảng thời gian
   * @param {Object} options - Các tùy chọn để lọc và nhóm dữ liệu
   * @returns {Object} - Dữ liệu thống kê bài viết theo thời gian
   */
  async getPostsByDateRange(options = {}) {
    try {
      const startDate = options.startDate ? new Date(options.startDate) : new Date(new Date().setDate(new Date().getDate() - 30));
      const endDate = options.endDate ? new Date(options.endDate) : new Date();
      const groupByInterval = options.groupBy || 'day'; // 'day', 'week', 'month'
      const languageId = parseInt(options.languageId, 10) || null;
      const categoryId = parseInt(options.categoryId, 10) || null;
      const userId = parseInt(options.userId, 10) || null;

      // Điều kiện cơ bản: trong khoảng thời gian
      let where = {
        createdAt: {
          [Op.between]: [startDate, endDate]
        }
      };

      // Thêm điều kiện lọc nếu có
      if (languageId) {
        where.language_id = languageId;
      }

      if (userId) {
        where.user_id = userId;
      }

      // Xác định trường group by dựa trên interval
      let dateFormat;
      switch (groupByInterval) {
        case 'week':
          // Format: YYYY-WW (Năm-Tuần)
          dateFormat = Sequelize.fn('DATE_FORMAT', Sequelize.col('created_at'), '%Y-%u');
          break;
        case 'month':
          // Format: YYYY-MM (Năm-Tháng)
          dateFormat = Sequelize.fn('DATE_FORMAT', Sequelize.col('created_at'), '%Y-%m');
          break;
        default: // day
          // Format: YYYY-MM-DD (Năm-Tháng-Ngày)
          dateFormat = Sequelize.fn('DATE_FORMAT', Sequelize.col('created_at'), '%Y-%m-%d');
          break;
      }

      // Tạo query cơ bản
      let queryOptions = {
        attributes: [
          [dateFormat, 'date'],
          [Sequelize.fn('COUNT', Sequelize.col('id')), 'count']
        ],
        where,
        group: ['date'],
        raw: true,
        order: [[Sequelize.col('date'), 'ASC']]
      };

      // Nếu có categoryId, cần join với bảng PostCategory
      if (categoryId) {
        queryOptions.include = [
          {
            model: Category,
            attributes: [],
            where: { id: categoryId },
            through: { attributes: [] }
          }
        ];
      }

      // Thực hiện truy vấn
      const results = await Post.findAll(queryOptions);

      // Điều chỉnh kết quả để bao gồm cả những ngày không có bài viết
      const statsMap = new Map();
      results.forEach(item => {
        statsMap.set(item.date, Number(item.count));
      });

      const stats = [];
      let currentDate = new Date(startDate);

      while (currentDate <= endDate) {
        let dateKey;
        switch (groupByInterval) {
          case 'week':
            // Lấy số tuần trong năm
            const weekNumber = getWeekNumber(currentDate);
            dateKey = `${currentDate.getFullYear()}-${weekNumber.toString().padStart(2, '0')}`;
            // Tăng thêm 1 tuần
            currentDate.setDate(currentDate.getDate() + 7);
            break;
          case 'month':
            dateKey = `${currentDate.getFullYear()}-${(currentDate.getMonth() + 1).toString().padStart(2, '0')}`;
            // Tăng thêm 1 tháng
            currentDate.setMonth(currentDate.getMonth() + 1);
            break;
          default: // day
            dateKey = `${currentDate.getFullYear()}-${(currentDate.getMonth() + 1).toString().padStart(2, '0')}-${currentDate.getDate().toString().padStart(2, '0')}`;
            // Tăng thêm 1 ngày
            currentDate.setDate(currentDate.getDate() + 1);
            break;
        }

        stats.push({
          date: dateKey,
          count: statsMap.get(dateKey) || 0
        });
      }

      // Nếu người dùng yêu cầu tổng số
      if (options.includeTotal) {
        // Đếm tổng số bài viết trong khoảng thời gian
        const { count } = await Post.findAndCountAll({
          where,
          distinct: true,
          include: categoryId ? [
            {
              model: Category,
              attributes: [],
              where: { id: categoryId },
              through: { attributes: [] }
            }
          ] : []
        });

        return {
          total: count,
          stats
        };
      }

      return stats;
    } catch (error) {
      console.error('Error in getPostsByDateRange:', error);
      throw error;
    }
  }

  // ============================================
  // LẤY THỐNG KÊ BÀI VIẾT - getPostStats
  // ============================================
  /**
   * Lấy dữ liệu thống kê bài viết
   * @param {Object} options - Các tùy chọn thống kê
   * @returns {Object} - Dữ liệu thống kê bài viết
   */
  async getPostStats(options = {}) {
    try {
      const startDate = options.startDate ? new Date(options.startDate) : new Date(new Date().setDate(new Date().getDate() - 30));
      const endDate = options.endDate ? new Date(options.endDate) : new Date();
      
      // Lấy dữ liệu thống kê bài viết theo thời gian
      const postStats = await this.getPostsByDateRange({
        ...options,
        includeTotal: true
      });
      
      // Phân bố bài viết theo danh mục - sử dụng SQL trực tiếp thay vì ORM
      const categoryDistribution = await db.sequelize.query(`
        SELECT c.id, c.name, COUNT(pc.post_id) as count 
        FROM categories c 
        JOIN post_categories pc ON c.id = pc.category_id 
        JOIN posts p ON pc.post_id = p.id 
        WHERE p.created_at BETWEEN :startDate AND :endDate 
        GROUP BY c.id, c.name 
        ORDER BY count DESC 
        LIMIT 5
      `, {
        replacements: { startDate, endDate },
        type: Sequelize.QueryTypes.SELECT
      });
      
      // Phân bố bài viết theo ngôn ngữ - sử dụng SQL trực tiếp
      const languageDistribution = await db.sequelize.query(`
        SELECT l.id, l.name, COUNT(p.id) as count 
        FROM languages l 
        JOIN posts p ON l.id = p.language_id 
        WHERE p.created_at BETWEEN :startDate AND :endDate 
        GROUP BY l.id, l.name
      `, {
        replacements: { startDate, endDate },
        type: Sequelize.QueryTypes.SELECT
      });
      
      // Tính toán tổng số lượt xem trong khoảng thời gian
      const viewsCount = await Post.sum('views', {
        where: {
          createdAt: {
            [Op.between]: [startDate, endDate]
          }
        }
      });
      
      // Tính toán tăng trưởng so với khoảng thời gian trước đó
      const timeRange = endDate.getTime() - startDate.getTime();
      const previousStartDate = new Date(startDate.getTime() - timeRange);
      
      // Tính số bài viết trong khoảng thời gian trước đó
      const previousPostsCount = await Post.count({
        where: {
          createdAt: {
            [Op.between]: [previousStartDate, startDate]
          }
        },
        distinct: true
      });
      
      // Tính tỷ lệ tăng trưởng
      const postGrowth = previousPostsCount > 0 
        ? ((postStats.total - previousPostsCount) / previousPostsCount) * 100 
        : 100;
      
      return {
        total: postStats.total,
        growth: parseFloat(postGrowth.toFixed(2)),
        timeData: postStats.stats,
        categories: categoryDistribution,
        languages: languageDistribution,
        views: {
          total: viewsCount || 0,
          growth: 0 // Có thể triển khai tương tự như postGrowth
        }
      };
    } catch (error) {
      console.error('Error in getPostStats:', error);
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

module.exports = new PostService(); 