const passport = require('passport');
const jwtService = require('kernels/jwt');
const response = require('utils/responseUtils');

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

/**
 * Middleware OAuth với Google
 */
const authenticateGoogle = passport.authenticate('google', {
  scope: ['profile', 'email']
});

/**
 * Middleware OAuth với GitHub
 */
const authenticateGithub = passport.authenticate('github', {
  scope: ['user:email']
});

/**
 * Middleware callback cho Google OAuth
 */
const googleCallback = passport.authenticate('google', {
  session: false,
  failureRedirect: '/auth/login'
});

/**
 * Middleware callback cho GitHub OAuth
 */
const githubCallback = passport.authenticate('github', {
  session: false,
  failureRedirect: '/auth/login'
});

/**
 * Tạo JWT token
 * @param {Object} user - Thông tin người dùng
 * @returns {String} - JWT token
 */
const generateToken = (user) => {
  return jwtService.generate({
    id: user.id,
    email: user.email,
    role: user.role?.name || 'user'
  });
};

module.exports = {
  authenticateJWT,
  authenticateGoogle,
  authenticateGithub,
  googleCallback,
  githubCallback,
  generateToken
}; 