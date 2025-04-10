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
 * Middleware kiểm tra vai trò admin
 */
const isAdmin = (req, res, next) => {
  // Kiểm tra đã xác thực user chưa
  if (!req.user) {
    return response.unauthorized(res, 'Vui lòng đăng nhập để tiếp tục.');
  }

  // Kiểm tra user có vai trò admin không
  if (req.user.role && req.user.role.name === 'admin') {
    return next();
  }

  // Trả về lỗi nếu không phải admin
  return response.forbidden(res, 'Chỉ quản trị viên mới có quyền truy cập tính năng này.');
};

/**
 * Middleware kiểm tra vai trò blogger hoặc admin
 */
const isBlogger = (req, res, next) => {
  // Kiểm tra đã xác thực user chưa
  if (!req.user) {
    return response.unauthorized(res, 'Vui lòng đăng nhập để tiếp tục.');
  }

  // Kiểm tra user có vai trò blogger hoặc admin không
  if (req.user.role && (req.user.role.name === 'blogger' || req.user.role.name === 'admin')) {
    return next();
  }

  // Trả về lỗi nếu không phải blogger/admin
  return response.forbidden(res, 'Chỉ blogger hoặc quản trị viên mới có quyền truy cập tính năng này.');
};

module.exports = {
  hasRole,
  isAdmin,
  isBlogger
}; 