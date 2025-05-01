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
      const includeRelations = options.includeRelations || false;
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

      // Tạo query để lấy danh sách bài viết
      const queryOptions = {
        where,
        include: includeRelations ? [ 
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
        ]:[],
        order: [[orderBy, order]],
        limit,
        offset,
        distinct: true
      };
      
      // Nếu có categoryId, thêm điều kiện lọc theo category
      if (categoryId) {
        queryOptions.include = queryOptions.include.map(inc => {
          if (inc.model === Category) {
            return {
              ...inc,
              where: { id: categoryId }
            };
          }
          return inc;
        });
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
}

module.exports = new PostService(); 