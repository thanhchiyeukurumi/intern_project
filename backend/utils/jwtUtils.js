const { config } = require("configs");
const jwt = require("jsonwebtoken");

module.exports = {
  /**
   * Tạo token access
   * @param {String} userId - ID của người dùng
   * @param {String} userRole - Vai trò của người dùng
   * @returns {String} - Token access
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
   * Tạo token refresh
   * @param {String} userId - ID của người dùng
   * @param {String} userRole - Vai trò của người dùng
   * @returns {String} - Token refresh
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
   * Xác thực JWT token
   * @param {String} token - JWT token cần xác thực
   * @returns {Object} - Dữ liệu đã giải mã từ token
   * @throws {Error} - Lỗi khi token không hợp lệ hoặc hết hạn
   */
  verify: (token) => {
    try {
      return jwt.verify(token, config.jwt.secret);
    } catch (error) {
      return null;
    }
  },
    /**
   * Giải mã JWT token mà không xác thực
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
   * Tạo JWT token với payload và tùy chọn cho trước
   * Nếu cần token cho nhiều mục đích khác (email verify, password reset, API key...) 
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
