const postService = require('../services/postService');
const { ok, created, notFound, error, customError, conflict } = require('../../../utils/responseUtils');

class PostController {
  // ============================================
  // LẤY DANH SÁCH BÀI VIẾT - getAllPosts
  // ============================================
  /**
   * GET /posts
   * @desc    Lấy danh sách bài viết
   * @access  Public
   * @query   {number} page           - Trang hiện tại
   * @query   {number} limit          - Số bài viết trên mỗi trang
   * @query   {string} search         - Từ khóa tìm kiếm
   * @query   {number} category       - ID danh mục
   * @query   {number} language       - ID ngôn ngữ
   * @query   {string} orderBy        - Trường sắp xếp
   * @query   {string} order          - Hướng sắp xếp
   */
  async getAllPosts(req, res) {
    try {
      const options = {
        page: req.query.page || 1,
        limit: req.query.limit || 10,
        search: req.query.search,
        categoryId: req.query.category,
        languageId: req.query.language,
        orderBy: req.query.orderBy || 'createdAt',
        order: req.query.order || 'DESC',
        includeRelations: req.query.includeRelations || false,
        originalPost: req.query.originalPost === 'true'
      };
      
      const result = await postService.getAllPosts(options);
      return ok(res, result);
    } catch (err) {
      return error(res, err.message);
    }
  }

  // ============================================
  // LẤY BÀI VIẾT THEO ID HOẶC SLUG - getPostByIdOrSlug
  // ============================================
  /**
   * GET /posts/:id
   * @desc    Lấy bài viết theo ID hoặc slug
   * @access  Public
   */
  async getPostByIdOrSlug(req, res) {
    try {
      const identifier = req.params.id || req.params.slug;
      const incrementViews = req.query.view === 'true';
      
      const post = await postService.getPostByIdOrSlug(identifier, incrementViews);
      return ok(res, post);
    } catch (err) {
      if (err.statusCode == 404) { return notFound(res, err.message); }
      return error(res, err.message);
    }
  }

  // ============================================
  // TẠO BÀI VIẾT MỚI - createPost
  // ============================================
  /**
   * POST /posts
   * @desc    Tạo bài viết mới
   * @access  User
   */
  async createPost(req, res) {
    try {
      const userId = req.user.id;
      const post = await postService.createPost(req.body, userId);
      return created(res, post, 'Tạo bài viết thành công');
    } catch (err) {
      if (err.statusCode == 409) { return conflict(res, err.message); }
      return error(res, err.message);
    }
  }

  // ============================================
  // CẬP NHẬT BÀI VIẾT - updatePost
  // ============================================
  /**
   * PUT /posts/:id
   * @desc    Cập nhật bài viết
   * @access  Owner
   */
  async updatePost(req, res) {
    try {
      const post = await postService.updatePost(req.params.id, req.body);
      return ok(res, post, 'Cập nhật bài viết thành công');
    } catch (err) {
      if (err.statusCode == 404) { return notFound(res, err.message); }
      return error(res, err.message);
    }
  }

  // ============================================
  // XÓA BÀI VIẾT - deletePost
  // ============================================
  /**
   * DELETE /posts/:id
   * @desc    Xóa bài viết
   * @access  Admin
   */
  async deletePost(req, res) {
    try {
      await postService.deletePost(req.params.id);
      return ok(res, 'Xóa bài viết thành công');
    } catch (err) {
      if (err.statusCode == 404) { return notFound(res, err.message); }
      return error(res, err.message);
    }
  }

  // ============================================
  // LẤY DANH SÁCH BÀI VIẾT THEO DANH MỤC - getPostsByCategory
  // ============================================
  /**
   * GET /posts/category/:categoryId
   * @desc    Lấy danh sách bài viết theo danh mục
   * @access  Public
   */
  async getPostsByCategory(req, res) {
    try {
      const categoryId = req.params.categoryId;
      const options = {
        page: req.query.page || 1,
        limit: req.query.limit || 10,
        orderBy: req.query.orderBy || 'created_at',
        order: req.query.order || 'DESC'
      };
      
      const result = await postService.getPostsByCategory(categoryId, options);
      return ok(res, result);
    } catch (err) {
      if (err.statusCode == 404) { return notFound(res, err.message); }
      return error(res, err.message);
    }
  }

  // ============================================
  // LẤY DANH SÁCH BÀI VIẾT THEO NGƯỜI DÙNG - getPostsByUser
  // ============================================
  /**
   * GET /posts/user/:userId
   * @desc    Lấy danh sách bài viết của người dùng
   * @access  Public
   */
  async getPostsByUser(req, res) {
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
        order: req.query.order || 'DESC',
        originalPost: req.query.originalPost === 'true',
      };
      
      const result = await postService.getPostsByUser(userId, options);
      return ok(res, result);
    } catch (err) {
      if (err.statusCode == 404) { return notFound(res, err.message); }
      return error(res, err.message);
    }
  }

  // ============================================
  // TÌM KIẾM BÀI VIẾT - searchPosts
  // ============================================
  /**
   * GET /posts/search
   * @desc    Tìm kiếm bài viết
   * @access  Public
   */
  async searchPosts(req, res) {
    try {
      const options = {
        page: req.query.page || 1,
        limit: req.query.limit || 10,
        search: req.query.q,
        categoryId: req.query.category,
        languageId: req.query.language,
        orderBy: req.query.orderBy || 'created_at',
        order: req.query.order || 'DESC'
      };
      
      const result = await postService.getAllPosts(options);
      return ok(res, result);
    } catch (err) {
      if (err.statusCode == 404) { return notFound(res, err.message); }
      return error(res, err.message);
    }
  }

  // ============================================
  // LẤY DANH SÁCH BÀI VIẾT TỪ BÀI GỐC - getPostsFromOriginal
  // ============================================
  /**
   * GET /posts/original/:originalPostId
   * @desc    Lấy danh sách các bài viết được dịch/phát triển từ một bài viết gốc
   * @access  Public
   * @param   {number} originalPostId - ID của bài viết gốc
   * @query   {number} page           - Trang hiện tại
   * @query   {number} limit          - Số bài viết trên mỗi trang
   * @query   {string} orderBy        - Trường sắp xếp
   * @query   {string} order          - Hướng sắp xếp
   * @query   {boolean} includeRelations - Có bao gồm các quan hệ không
   */
  async getPostsFromOriginal(req, res) {
    try {
      const originalPostId = parseInt(req.params.originalPostId, 10); // Lấy ID từ params

      // Kiểm tra xem originalPostId có hợp lệ không
      if (isNaN(originalPostId)) {
         return customError(res, 400, 'ID bài viết gốc không hợp lệ');
      }

      const options = {
        page: req.query.page || 1,
        limit: req.query.limit || 10,
        orderBy: req.query.orderBy || 'createdAt',
        order: req.query.order || 'DESC',
        includeRelations: req.query.includeRelations === 'true', // Chú ý: query params là string
        fromOriginalPostId: originalPostId,
        originalPost: req.query.originalPost === 'true' // Đảm bảo không bị xung đột với logic chỉ lấy bài gốc trong service
      };
      const result = await postService.getAllPosts(options);


      // Kết quả trả về sẽ là danh sách các bài viết có original_post_id = originalPostId
      // Nếu không có bài nào, result.data sẽ là mảng rỗng và result.pagination.total = 0
      // Trường hợp không tìm thấy bài viết gốc có ID đó, service getAllPosts sẽ trả về danh sách rỗng,
      // nên không cần check 404 cho bài gốc ở đây.

      return ok(res, result);
    } catch (err) {
      console.error("Error in getPostsFromOriginal:", err); // Log lỗi
      // Xử lý các loại lỗi khác nếu cần
      return error(res, err.message);
    }
  }

  // ============================================
  // LẤY THỐNG KÊ BÀI VIẾT THEO KHOẢNG THỜI GIAN - getPostsByDateRange
  // ============================================
  /**
   * GET /posts/stats/date-range
   * @desc    Lấy thống kê bài viết theo khoảng thời gian
   * @access  Public
   * @query   {string} startDate      - Ngày bắt đầu (ISO format)
   * @query   {string} endDate        - Ngày kết thúc (ISO format)
   * @query   {string} groupBy        - Cách nhóm dữ liệu (day/week/month)
   * @query   {number} languageId     - ID ngôn ngữ để lọc (optional)
   * @query   {number} categoryId     - ID danh mục để lọc (optional)
   * @query   {number} userId         - ID người dùng để lọc (optional)
   * @query   {boolean} includeTotal  - Có bao gồm tổng số không (optional)
   */
  async getPostsByDateRange(req, res) {
    try {
      const options = {
        startDate: req.query.startDate,
        endDate: req.query.endDate,
        groupBy: req.query.groupBy || 'day',
        languageId: req.query.languageId,
        categoryId: req.query.categoryId,
        userId: req.query.userId,
        includeTotal: req.query.includeTotal === 'true'
      };
      
      const result = await postService.getPostsByDateRange(options);
      return ok(res, result);
    } catch (err) {
      console.error('Error in getPostsByDateRange controller:', err);
      return error(res, err.message);
    }
  }

  // ============================================
  // LẤY THỐNG KÊ TỔNG HỢP CHO DASHBOARD - getPostStats
  // ============================================
  /**
   * GET /posts/stats/dashboard
   * @desc    Lấy thống kê tổng hợp về bài viết
   * @access  Admin
   */
  async getPostStats(req, res) {
    try {
      const options = {
        startDate: req.query.startDate || null,
        endDate: req.query.endDate || null,
        groupBy: req.query.groupBy || 'day'
      };
      
      const stats = await postService.getPostStats(options);
      return ok(res, stats);
    } catch (err) {
      return error(res, err.message);
    }
  }
}

module.exports = new PostController(); 