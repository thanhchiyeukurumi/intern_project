const jwt = require('jsonwebtoken');
const jwtConfig = require('configs/jwt');

const jwtService = {
  /**
   * Tạo JWT token với payload và tùy chọn cho trước
   * @param {Object} payload - Dữ liệu cần mã hóa vào token
   * @param {Object} options - Tùy chọn thêm, ghi đè lên mặc định
   * @returns {String} - JWT token
   */
  generate: (payload, options = {}) => {
    const tokenOptions = {
      ...jwtConfig.options,
      ...options
    };
    return jwt.sign(payload, jwtConfig.secret, tokenOptions);
  },

  /**
   * Xác thực JWT token
   * @param {String} token - JWT token cần xác thực
   * @returns {Object} - Dữ liệu đã giải mã từ token
   * @throws {Error} - Lỗi khi token không hợp lệ hoặc hết hạn
   */
  verify: (token) => {
    return jwt.verify(token, jwtConfig.secret);
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
  }
};

module.exports = jwtService; 