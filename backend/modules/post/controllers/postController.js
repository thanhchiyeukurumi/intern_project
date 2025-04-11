const postService = require('../services/postService');
const { ok, created, notFound, error, customError } = require('../../../utils/responseUtils');

class PostController {
  /**
   * Lấy danh sách bài viết
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

  /**
   * Lấy bài viết theo ID hoặc slug
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

  /**
   * Tạo bài viết mới
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

  /**
   * Cập nhật bài viết
   */
  async updatePost(req, res) {
    try {
      const postId = req.params.id;
      const userId = req.user.id;
      
      const post = await postService.updatePost(postId, req.body, userId);
      return ok(res, post, 'Cập nhật bài viết thành công');
    } catch (err) {
      if (err.message.includes('Không tìm thấy bài viết')) {
        return notFound(res, err.message);
      }
      return error(res, err.message);
    }
  }

  /**
   * Xóa bài viết
   */
  async deletePost(req, res) {
    try {
      const postId = req.params.id;
      const userId = req.user.id;
      
      await postService.deletePost(postId, userId);
      return ok(res, null, 'Xóa bài viết thành công');
    } catch (err) {
      if (err.message.includes('Không tìm thấy bài viết')) {
        return notFound(res, err.message);
      }
      return error(res, err.message);
    }
  }

  /**
   * Lấy danh sách bài viết theo danh mục
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

  /**
   * Lấy danh sách bài viết của người dùng
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

  /**
   * Tìm kiếm bài viết
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