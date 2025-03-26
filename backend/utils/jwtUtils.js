const { config } = require("../configs");
const jwt = require("jsonwebtoken");

/**
 * Tiện ích xử lý JSON Web Token (JWT)
 * ----------------------------------------
 * Module này cung cấp các hàm để làm việc với JWT, được phân thành 2 nhóm:
 * 
 * 1. Các hàm xác thực người dùng (Authentication):
 *    - sign: Tạo access token
 *    - signRefreshToken: Tạo refresh token
 * 
 * 2. Các hàm cho mục đích khác:
 *    - generate: Tạo token cho nhiều mục đích khác nhau (email verification, password reset, API keys...)
 *    - verify: Xác thực tính hợp lệ của token
 *    - decode: Giải mã token mà không kiểm tra tính hợp lệ
 */
module.exports = {
  /**
   * [AUTHENTICATION] Tạo access token cho việc xác thực người dùng
   * @param {String} userId - ID của người dùng
   * @param {String} userRole - Vai trò của người dùng
   * @returns {String} - Access token
   */
  sign: (userId, userRole) => {
    const access_token = jwt.sign(
      {
        userId: userId,
        role: userRole,
      },
      config.jwt.secret,
      {
        expiresIn: config.jwt.ttl,
      }
    );

    return access_token;
  },
  
  /**
   * [AUTHENTICATION] Tạo refresh token cho việc xác thực người dùng
   * @param {String} userId - ID của người dùng
   * @param {String} userRole - Vai trò của người dùng
   * @returns {String} - Refresh token (thời hạn dài hơn access token)
   */
  signRefreshToken: (userId, userRole) => {
    const refresh_token = jwt.sign(
      {
        userId: userId,
        role: userRole,
      },
      config.jwt.secret,
      {
        expiresIn: "1y",
      }
    );

    return refresh_token;
  },
  
  /**
   * [GENERAL] Xác thực JWT token
   * @param {String} token - JWT token cần xác thực
   * @returns {Object|null} - Dữ liệu đã giải mã từ token hoặc null nếu không hợp lệ
   */
  verify: (token) => {
    try {
      return jwt.verify(token, config.jwt.secret);
    } catch (error) {
      return null;
    }
  },
    
  /**
   * [GENERAL] Giải mã JWT token mà không xác thực
   * @param {String} token - JWT token cần giải mã
   * @returns {Object|null} - Dữ liệu đã giải mã hoặc null nếu lỗi
   */
  decode: (token) => {
    try {
      return jwt.decode(token);
    } catch (error) {
      return null;
    }
  },
   
  /**
   * [GENERAL] Tạo JWT token với payload và tùy chọn cho trước
   * Sử dụng cho các mục đích NGOÀI AUTHENTICATION như:
   * - Email verification
   * - Password reset
   * - API keys
   * - Invite tokens
   * - Temporary access tokens
   * 
   * @param {Object} payload - Dữ liệu cần mã hóa vào token
   * @param {Object} options - Tùy chọn thêm, ghi đè lên mặc định
   * @returns {String} - JWT token
   */
  generate: (payload, options = {}) => {
    const tokenOptions = {
      ...config.jwt.options,
      ...options
    };
    return jwt.sign(payload, config.jwt.secret, tokenOptions);
  }
};
