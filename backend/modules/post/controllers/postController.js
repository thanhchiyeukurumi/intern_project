const postService = require('../services/postService');
const { ok, created, notFound, error, customError } = require('../../../utils/responseUtils');

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
        includeRelations: req.query.includeRelations || false
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
      if (err.message === 'Không tìm thấy bài viết') {
        return notFound(res, err.message);
      }
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
      if (err.message.includes('Không tìm thấy bài viết')) {
        return notFound(res, err.message);
      }
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
      if (err.message.includes('Không tìm thấy bài viết')) {
        return notFound(res, err.message);
      }
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
        order: req.query.order || 'DESC'
      };
      
      const result = await postService.getPostsByUser(userId, options);
      return ok(res, result);
    } catch (err) {
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
      return error(res, err.message);
    }
  }
}

module.exports = new PostController(); 