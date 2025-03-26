const { validationResult } = require('express-validator');
const authService = require('../services/authService');
const jwtService = require('kernels/jwt');
const { ok, error, unauthorized, invalidated, created, customError } = require('utils/responseUtils');

class AuthController {
  /**
   * Đăng ký tài khoản mới
   * @route POST /api/auth/register
   */
  async register(req, res) {
    try {
      // Kiểm tra lỗi validation
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return invalidated(res, errors.array());
      }

      // Gọi service đăng ký
      const { user, token } = await authService.register(req.body);

      // Trả về kết quả
      return created(res, { user, token }, 'Đăng ký tài khoản thành công.');
    } catch (err) {
      const statusCode = err.statusCode || 500;
      return customError(res, statusCode, err.message || 'Đã xảy ra lỗi khi đăng ký tài khoản.');
    }
  }

  /**
   * Đăng nhập
   * @route POST /api/auth/login
   */
  async login(req, res) {
    try {
      // Kiểm tra lỗi validation
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return invalidated(res, errors.array());
      }

      const { email, password } = req.body;

      // Gọi service đăng nhập
      const { user, token } = await authService.login(email, password);

      // Trả về kết quả
      return ok(res, {
        user,
        token
      });
    } catch (err) {
      const statusCode = err.statusCode || 500;
      return customError(res, statusCode, err.message || 'Đã xảy ra lỗi khi đăng nhập.');
    }
  }

  /**
   * Xử lý callback từ Google OAuth
   * @route GET /api/auth/google/callback
   */
  async googleCallback(req, res) {
    try {
      if (!req.user) {
        return unauthorized(res, 'Đăng nhập Google thất bại.');
      }

      // Xử lý người dùng OAuth
      const { user, token } = await authService.handleOAuthUser(req.user);

      // Chuyển hướng đến frontend với token
      const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
      return res.redirect(`${frontendUrl}/auth/oauth?token=${token}`);
    } catch (err) {
      const statusCode = err.statusCode || 500;
      return error(res, err.message || 'Đã xảy ra lỗi khi đăng nhập với Google.');
    }
  }

  /**
   * Xử lý callback từ GitHub OAuth
   * @route GET /api/auth/github/callback
   */
  async githubCallback(req, res) {
    try {
      if (!req.user) {
        return unauthorized(res, 'Đăng nhập GitHub thất bại.');
      }

      // Xử lý người dùng OAuth
      const { user, token } = await authService.handleOAuthUser(req.user);

      // Chuyển hướng đến frontend với token
      const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
      return res.redirect(`${frontendUrl}/auth/oauth?token=${token}`);
    } catch (err) {
      const statusCode = err.statusCode || 500;
      return error(res, err.message || 'Đã xảy ra lỗi khi đăng nhập với GitHub.');
    }
  }

  /**
   * Lấy thông tin người dùng hiện tại
   * @route GET /api/auth/me
   */
  async getCurrentUser(req, res) {
    try {
      // Lấy thông tin user từ token đã xác thực
      const user = await authService.getCurrentUser(req.user.id);
      return ok(res, user);
    } catch (err) {
      const statusCode = err.statusCode || 500;
      return error(res, err.message || 'Đã xảy ra lỗi khi lấy thông tin người dùng.');
    }
  }

  /**
   * Xác thực token
   * @route GET /api/auth/verify-token
   */
  async verifyToken(req, res) {
    try {
      // req.user đã được xác thực qua middleware authenticateJWT
      return ok(res, req.user);
    } catch (err) {
      return unauthorized(res, 'Token không hợp lệ hoặc đã hết hạn.');
    }
  }
}

module.exports = new AuthController(); 