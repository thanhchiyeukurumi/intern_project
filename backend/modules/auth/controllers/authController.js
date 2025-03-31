const { validationResult } = require('express-validator');
const authService = require('../services/authService');
const jwtUtils = require('../../../utils/jwtUtils');
const { ok, error, unauthorized, invalidated, created, customError } = require('../../../utils/responseUtils');

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
      const { user, token, refreshToken } = await authService.register(req.body);

      // Lưu refresh token vào cookie
      res.cookie('refreshToken', refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        maxAge: 30 * 24 * 60 * 60 * 1000, // 30 ngày
        sameSite: 'strict'
      });

      // Trả về kết quả
      return created(res, { 
        user, 
        token 
      }, 'Đăng ký tài khoản thành công.');
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
      const { user, token, refreshToken } = await authService.login(email, password);

      // Lưu refresh token vào cookie
      res.cookie('refreshToken', refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        maxAge: 30 * 24 * 60 * 60 * 1000, // 30 ngày
        sameSite: 'strict'
      });

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
   * Làm mới token
   * @route POST /api/auth/refresh-token
   */
  async refreshToken(req, res) {
    try {
      // Lấy refresh token từ cookie
      const refreshToken = req.cookies.refreshToken;
      
      if (!refreshToken) {
        return unauthorized(res, 'Không tìm thấy refresh token.');
      }

      // Xác thực refresh token
      const payload = jwtUtils.verify(refreshToken);
      if (!payload) {
        return unauthorized(res, 'Refresh token không hợp lệ hoặc đã hết hạn.');
      }

      // Tìm user dựa trên id từ payload
      const user = await authService.getCurrentUser(payload.id);
      if (!user) {
        return unauthorized(res, 'Không tìm thấy người dùng.');
      }

      // Tạo access token mới
      const newToken = jwtUtils.generate({
        id: user.id,
        email: user.email,
        role: user.role?.name || 'user'
      });

      // Tạo refresh token mới (tùy chọn, để duy trì sliding window session)
      const newRefreshToken = jwtUtils.signRefreshToken(
        user.id,
        user.role?.name || 'user'
      );

      // Lưu refresh token mới vào cookie
      res.cookie('refreshToken', newRefreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        maxAge: 30 * 24 * 60 * 60 * 1000, // 30 ngày
        sameSite: 'strict'
      });

      // Trả về access token mới
      return ok(res, {
        token: newToken
      });
    } catch (err) {
      return unauthorized(res, 'Không thể làm mới token: ' + (err.message || 'Lỗi không xác định'));
    }
  }

  /**
   * Đăng xuất
   * @route POST /api/auth/logout
   */
  async logout(req, res) {
    try {
      // Xóa refresh token cookie
      res.clearCookie('refreshToken');
      
      return ok(res, null, 'Đăng xuất thành công.');
    } catch (err) {
      return error(res, 'Đã xảy ra lỗi khi đăng xuất: ' + err.message);
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
      const { user, token, refreshToken } = await authService.handleOAuthUser(req.user);

      // Tạo query params từ tokens để gửi về frontend
      const queryParams = new URLSearchParams({
        token,
        refreshToken
      }).toString();

      // Chuyển hướng đến frontend với token
      const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
      return res.redirect(`${frontendUrl}/auth/oauth?${queryParams}`);
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
      const { user, token, refreshToken } = await authService.handleOAuthUser(req.user);

      // Tạo query params từ tokens để gửi về frontend
      const queryParams = new URLSearchParams({
        token,
        refreshToken
      }).toString();

      // Chuyển hướng đến frontend với token
      const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
      return res.redirect(`${frontendUrl}/auth/oauth?${queryParams}`);
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