const bcrypt = require('bcryptjs');

const hash = {
  /**
   * Mã hóa chuỗi với bcrypt
   * @param {string} value - Chuỗi cần mã hóa (vd: password)
   * @param {number} saltRounds - Số vòng salt (mặc định: 10)
   * @returns {Promise<string>} - Chuỗi đã được mã hóa
   */
  make: async (value, saltRounds = 10) => {
    const salt = await bcrypt.genSalt(saltRounds);
    return bcrypt.hash(value, salt);
  },

  /**
   * So sánh chuỗi gốc với chuỗi đã mã hóa
   * @param {string} value - Chuỗi gốc chưa mã hóa
   * @param {string} hashedValue - Chuỗi đã được mã hóa
   * @returns {Promise<boolean>} - true nếu khớp, false nếu không khớp
   */
  check: async (value, hashedValue) => {
    return bcrypt.compare(value, hashedValue);
  }
};

module.exports = hash;

