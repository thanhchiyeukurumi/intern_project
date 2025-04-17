const { forbidden, unauthorized, error } = require('utils/responseUtils');
const db = require('models');
const { Post, Comment } = db;

// ============================================
// XÁC THỰC QUYỀN CỦA NGƯỜI DÙNG - hasRole
// ============================================
/**
 * Middleware xác thực quyền của người dùng
 * @param {Array} allowedRoles - Danh sách các vai trò được phép truy cập
 * @returns {Function} - Middleware function
 */
const hasRole = (allowedRoles) => {
  return (req, res, next) => {
    // Kiểm tra đã xác thực user chưa
    if (!req.user) {
      return unauthorized(res, 'Vui lòng đăng nhập để tiếp tục.');
    }

    // Kiểm tra role của user có trong allowedRoles không
    if (req.user.role && allowedRoles.includes(req.user.role.name)) {
      return next();
    }

    // Trả về lỗi nếu không có quyền
    return forbidden(res, 'Bạn không có quyền truy cập tính năng này.');
  };
};

// ============================================
// KIỂM TRA QUYỀN SỞ HỮU CỦA NGƯỜI DÙNG - isOwner
// ============================================
/**
 * Middleware kiểm tra quyền sở hữu của người dùng
 * @param {string} paramName  - Tên tham số chứa ID của người dùng, trong lúc gọi middleware thì không cần truyền tham số này
 * @returns {Function} - Middleware function
 */
const isOwner = (paramName = 'id') => {
  return (req, res, next) => {
    try {
      const currentUserId = req.user?.id; // Lấy ID của người dùng đã xác thực qua JWT token
      const targetUserId = req.params?.[paramName] || req.body?.[paramName]; // Lấy ID của người dùng cần thực hiện hành động từ params hoặc body

      if (!currentUserId || !targetUserId) {
        return error(res, 'Không đủ thông tin xác thực', 400);
      }

      if (parseInt(currentUserId) !== parseInt(targetUserId)) {
        return forbidden(res, 'Bạn không có quyền thực hiện hành động này');
      }

      next();
    } catch (err) {
      return error(res, 'Lỗi xác thực quyền sở hữu', 500);
    }
  };
};

// ============================================
// KIỂM TRA QUYỀN ADMIN HOẶC CHỦ SỞ HỮU - isAdminOrOwner
// ============================================
/**
 * Middleware kiểm tra quyền admin hoặc chủ sở hữu
 * @param {string} paramName  - Tên tham số chứa ID của người dùng, trong lúc gọi middleware thì không cần truyền tham số này
 * @returns {Function} - Middleware function
 */
const isAdminOrOwner = (paramName = 'id') => {
  return (req, res, next) => {
    try {
      const currentUserId = req.user?.id; // Lấy ID của người dùng đã xác thực qua JWT token
      const targetUserId = req.params?.[paramName] || req.body?.[paramName]; // Lấy ID của người dùng cần thực hiện hành động từ params hoặc body
      const currentUserRole = req.user?.role?.name;
      if (currentUserRole == "admin") {
        return next();
      }
      if (!currentUserId || !targetUserId) {
        return error(res, 'Không đủ thông tin xác thực', 400);
      }

      if (parseInt(currentUserId) !== parseInt(targetUserId)) {
        return forbidden(res, 'Bạn không có quyền thực hiện hành động này');
      }

      next();
    } catch (err) {
      return error(res, 'Lỗi xác thực quyền sở hữu', 500);
    }
  };
};

// ============================================
// KIỂM TRA QUYỀN CHỦ SỞ HỮU BÀI VIẾT - isPostOwner
// ============================================
/**
 * Middleware kiểm tra chủ sở hữu bài viết
 * @returns {Function} - Middleware function
 */
const isPostOwner = () => {
  return async (req, res, next) => {
    try {
      const postId = req.params.id;
      const userId = req.user?.id;

      if (!userId || !postId) {
        return error(res, 'Không đủ thông tin xác thực', 400);
      }

      // Kiểm tra bài viết có tồn tại và thuộc về người dùng hiện tại
      const post = await Post.findOne({
        where: { id: postId }
      });

      if (!post) {
        return notFound(res, 'Không tìm thấy bài viết');
      }

      // Kiểm tra người dùng hiện tại có phải là chủ sở hữu của bài viết
      if (post.user_id !== parseInt(userId)) {
        return forbidden(res, 'Bạn không phải chủ sở hữu của bài viết này');
      }

      // Lưu thông tin bài viết vào request để sử dụng sau này nếu cần
      req.post = post;
      next();
    } catch (err) {
      return error(res, 'Lỗi xác thực quyền sở hữu bài viết', 500);
    }
  };
};

// ============================================
// KIỂM TRA QUYỀN ADMIN HOẶC CHỦ SỞ HỮU BÀI VIẾT - isAdminOrPostOwner
// ============================================
/**
 * Middleware kiểm tra admin hoặc chủ sở hữu bài viết
 * @returns {Function} - Middleware function
 */
const isAdminOrPostOwner = () => {
  return async (req, res, next) => {
    try {
      const postId = req.params.id;
      const userId = req.user?.id;
      const userRole = req.user?.role?.name;

      // Nếu là admin, cho phép truy cập
      if (userRole === 'admin') {
        return next();
      }

      if (!userId || !postId) {
        return error(res, 'Không đủ thông tin xác thực', 400);
      }

      // Kiểm tra bài viết có tồn tại và thuộc về người dùng hiện tại
      const post = await Post.findOne({
        where: { id: postId }
      });

      if (!post) {
        return notFound(res, 'Không tìm thấy bài viết');
      }

      // Kiểm tra người dùng hiện tại có phải là chủ sở hữu của bài viết
      if (post.user_id !== parseInt(userId)) {
        return forbidden(res, 'Bạn không có quyền thực hiện hành động này');
      }

      // Lưu thông tin bài viết vào request để sử dụng sau này nếu cần
      req.post = post;
      next();
    } catch (err) {
      return error(res, 'Lỗi xác thực quyền sở hữu bài viết', 500);
    }
  };
};

// ============================================
// KIỂM TRA QUYỀN CHỦ SỞ HỮU BÌNH LUẬN - isCommentOwner
// ============================================
/**
 * Middleware kiểm tra chủ sở hữu bình luận
 * @returns {Function} - Middleware function
 */
const isCommentOwner = () => {
  return async (req, res, next) => {
    try {
      const commentId = req.params.id;
      const userId = req.user?.id;

      if (!userId || !commentId) {
        return error(res, 'Không đủ thông tin xác thực', 400);
      }

      // Kiểm tra bình luận có tồn tại và thuộc về người dùng hiện tại
      const comment = await Comment.findOne({
        where: { id: commentId }
      });

      if (!comment) {
        return notFound(res, 'Không tìm thấy bình luận');
      }

      // Kiểm tra người dùng hiện tại có phải là chủ sở hữu của bình luận
      if (comment.user_id !== parseInt(userId)) {
        return forbidden(res, 'Bạn không phải chủ sở hữu của bình luận này');
      }

      // Lưu thông tin bình luận vào request để sử dụng sau này nếu cần
      req.comment = comment;
      next();
    } catch (err) {
      return error(res, 'Lỗi xác thực quyền sở hữu bình luận', 500);
    }
  };
};

// ============================================
// KIỂM TRA QUYỀN ADMIN HOẶC CHỦ SỞ HỮU BÌNH LUẬN - isAdminOrCommentOwner
// ============================================
/**
 * Middleware kiểm tra admin hoặc chủ sở hữu bình luận
 * @returns {Function} - Middleware function
 */
const isAdminOrCommentOwner = () => {
  return async (req, res, next) => {
    try {
      const commentId = req.params.id;
      const userId = req.user?.id;
      const userRole = req.user?.role?.name;

      // Nếu là admin, cho phép truy cập
      if (userRole === 'admin') {
        return next();
      }

      if (!userId || !commentId) {
        return error(res, 'Không đủ thông tin xác thực', 400);
      }

      // Kiểm tra bình luận có tồn tại và thuộc về người dùng hiện tại
      const comment = await Comment.findOne({
        where: { id: commentId }
      });

      if (!comment) {
        return notFound(res, 'Không tìm thấy bình luận');
      }

      // Kiểm tra người dùng hiện tại có phải là chủ sở hữu của bình luận
      if (comment.user_id !== parseInt(userId)) {
        return forbidden(res, 'Bạn không có quyền thực hiện hành động này');
      }

      // Lưu thông tin bình luận vào request để sử dụng sau này nếu cần
      req.comment = comment;
      next();
    } catch (err) {
      return error(res, 'Lỗi xác thực quyền sở hữu bình luận', 500);
    }
  };
};

module.exports = {
  hasRole,
  isOwner,
  isAdminOrOwner,
  isPostOwner,
  isAdminOrPostOwner,
  isCommentOwner,
  isAdminOrCommentOwner
}; 