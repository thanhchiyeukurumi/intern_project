const response = require('utils/responseUtils');

/**
 * Middleware xác thực quyền của người dùng
 * @param {Array} allowedRoles - Danh sách các vai trò được phép truy cập
 * @returns {Function} - Middleware function
 */
const hasRole = (allowedRoles) => {
  return (req, res, next) => {
    // Kiểm tra đã xác thực user chưa
    if (!req.user) {
      return response.unauthorized(res, 'Vui lòng đăng nhập để tiếp tục.');
    }

    // Kiểm tra role của user có trong allowedRoles không
    if (req.user.role && allowedRoles.includes(req.user.role.name)) {
      return next();
    }

    // Trả về lỗi nếu không có quyền
    return response.forbidden(res, 'Bạn không có quyền truy cập tính năng này.');
  };
};

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
        return response.error(res, 'Không đủ thông tin xác thực', 400);
      }

      if (parseInt(currentUserId) !== parseInt(targetUserId)) {
        return response.forbidden(res, 'Bạn không có quyền thực hiện hành động này');
      }

      next();
    } catch (err) {
      return response.error(res, 'Lỗi xác thực quyền sở hữu', 500);
    }
  };
};

module.exports = {
  hasRole,
  isOwner
}; 