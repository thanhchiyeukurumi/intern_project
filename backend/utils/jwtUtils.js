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
        id: userId, // Sử dụng 'id' để phù hợp với payload trong generate
        role: userRole,
        type: 'refresh'
      },
      config.jwt.secret,
      {
        expiresIn: process.env.REFRESH_TOKEN_EXPIRY || "30d", // 30 ngày mặc định
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



// /**
//    * [GENERAL - STYLE GIỐNG SIGN] Tạo JWT token cho các mục đích cụ thể.
//    * Thay vì nhận payload object, hàm này nhận các tham số riêng lẻ.
//    *
//    * @param {String} subjectId - ID của đối tượng liên quan (vd: userId cho password reset).
//    * @param {String} purpose - Mục đích của token (QUAN TRỌNG, vd: 'password_reset', 'email_verify').
//    * @param {String} expiresIn - Thời gian hết hạn cho token này (vd: '1h', '15m').
//    * @param {Object} [additionalData={}] - Dữ liệu bổ sung muốn đưa vào payload.
//    * @returns {String} - JWT token
//    */
// generateLikeSign: (subjectId, purpose, expiresIn, additionalData = {}) => {
//   if (!purpose || !expiresIn) {
//       // Nên có kiểm tra chặt chẽ hơn hoặc throw Error
//       console.error("Purpose and expiresIn are required for generateLikeSign");
//       return null;
//   }

//   const payload = {
//     sub: subjectId, // Sử dụng 'sub' (subject) cho ID chung chung
//     pur: purpose,   // Thêm trường 'purpose' để phân biệt loại token
//     ...additionalData // Thêm dữ liệu phụ nếu có
//   };

//   const tokenOptions = {
//     expiresIn: expiresIn // Sử dụng thời hạn được truyền vào
//     // Có thể thêm các options khác nếu cần, ví dụ algorithm từ config.jwt.options
//     // algorithm: config.jwt.options.algorithm || 'HS256'
//   };

//   // Sử dụng secret mặc định
//   return jwt.sign(payload, config.jwt.secret, tokenOptions);
// },

// /**
//    * [AUTHENTICATION - STYLE GIỐNG GENERATE] Tạo access token dùng payload và options.
//    * Hàm này vẫn dành riêng cho việc tạo access token, nhưng linh hoạt hơn về payload.
//    *
//    * @param {Object} payload - Dữ liệu cần mã hóa vào access token (Nên chứa userId, role).
//    * @param {Object} [options={}] - Tùy chọn thêm, ghi đè lên mặc định (vd: ghi đè expiresIn).
//    * @returns {String} - Access token
//    */
// signLikeGenerate: (payload, options = {}) => {
//   // Kiểm tra payload tối thiểu (tùy chọn, nhưng nên có)
//   if (!payload || (!payload.userId && !payload.sub && !payload.id)) {
//       console.warn("Access token payload should ideally contain a user identifier (userId, sub, id)");
//   }

//   // Thiết lập options mặc định cho ACCESS TOKEN
//   const defaultAccessTokenOptions = {
//     ...config.jwt.options,    // Lấy các options cơ bản (vd: algorithm)
//     expiresIn: config.jwt.ttl // Đặt expiresIn mặc định là TTL của access token
//   };

//   // Gộp options mặc định với options người dùng truyền vào
//   const tokenOptions = {
//     ...defaultAccessTokenOptions,
//     ...options // Options truyền vào sẽ ghi đè mặc định (vd: nếu muốn access token lâu hơn)
//   };

//   // Sử dụng secret mặc định
//   return jwt.sign(payload, config.jwt.secret, tokenOptions);
// },