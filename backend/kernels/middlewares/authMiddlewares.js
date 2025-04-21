const passport = require('passport');
const jwtUtils = require('../../utils/jwtUtils');
const response = require('../../utils/responseUtils');
// ============================================
// XÁC THỰC JWT TOKEN - authenticateJWT
// ============================================
/**
 * Middleware xác thực JWT token
 * @param {Object} req - Request object
 * @param {Object} res - Response object
 * @param {Function} next - Next middleware
 */
const authenticateJWT = (req, res, next) => {
  passport.authenticate('jwt', { session: false }, (err, user, info) => {
    if (err) {
      return response.error(res, 'Lỗi xác thực: ' + err.message);
    }

    if (!user) {
      return response.unauthorized(res, 'Không có quyền truy cập. Vui lòng đăng nhập lại.');
    }

    // Gán thông tin user vào request
    req.user = user;
    next();
  })(req, res, next);
};

// ============================================
// XÁC THỰC GOOGLE - authenticateGoogle
// ============================================
/**
 * Middleware OAuth với Google
 */
const authenticateGoogle = passport.authenticate('google', {
  scope: ['profile', 'email']
});

// ============================================
// XÁC THỰC GOOGLE - googleCallback
// ============================================
/**
 * Middleware callback cho Google OAuth
 */
const googleCallback = passport.authenticate('google', {
  session: false,
  failureRedirect: '/auth/login'
});

module.exports = {
  authenticateJWT,
  authenticateGoogle,
  googleCallback,
}; 