const languageService = require('../services/languageService');
const { ok, created, notFound, error, customError, conflict } = require('../../../utils/responseUtils');

class LanguageController {
  // ============================================
  // LẤY DANH SÁCH NGÔN NGỮ - getAllLanguages
  // ============================================
  /**
   * GET /languages
   * @desc    Lấy danh sách ngôn ngữ
   * @access  User, Blogger, Admin
   * @query   {string} orderBy - Trường sắp xếp (vd: name, id)
   * @query   {string} order   - Hướng sắp xếp (ASC | DESC)
   */
  async getAllLanguages(req, res) {
    try {
      const options = {
        page: 1,
        limit: 1000,
        orderBy: req.query.orderBy || 'id',
        order: req.query.order || 'ASC',
      };
      const result = await languageService.getAllLanguages(options);
      return ok(res, result);
    } catch (err) {
      return error(res, err.message);
    }
  }

  // ============================================
  // LẤY NGÔN NGỮ THEO ID - getLanguageById
  // ============================================
  /**
   * GET /languages/:id
   * @desc    Lấy thông tin một ngôn ngữ
   * @access  User, Blogger, Admin
   */
  async getLanguageById(req, res) {
    try {
      const result = await languageService.getLanguageById(req.params.id);
      return ok(res, result);
    } catch (err) {
      if (err.statusCode == 404) { return notFound(res, err.message); }
      return error(res, err.message);
    }
  }
  // ============================================
  // TẠO NGÔN NGỮ MỚI - createLanguage
  // ============================================
  /**
   * POST /languages
   * @desc    Tạo ngôn ngữ mới
   * @access  Admin
   */
  async createLanguage(req, res) {
    try {
      const language = await languageService.createLanguage(req.body);
      return created(res, language, 'Tạo ngôn ngữ thành công');
    } catch (err) {
      if (err.statusCode == 409) { return conflict(res, err.message); }
      return error(res, err.message);
    }
  }
  // ============================================
  // CẬP NHẬT NGÔN NGỮ - updateLanguage
  // ============================================
  /**
   * PUT /languages/:id
   * @desc    Cập nhật ngôn ngữ
   * @access  Admin
   */
  async updateLanguage(req, res) {
    try {
      const { id } = req.params;
      const language = await languageService.updateLanguage(id, req.body);
      return ok(res, language, 'Cập nhật ngôn ngữ thành công');
    } catch (err) {
      if (err.statusCode == 404) { return notFound(res, err.message); }
      if (err.statusCode == 409) { return conflict(res, err.message); }
      return error(res, err.message);
    }
  }
  // ============================================
  /**
  * DELETE /languages/:id
   * @desc    Xóa ngôn ngữ
   * @access  Admin
   */
  async deleteLanguage(req, res) {
    try {
      const { id } = req.params;
      await languageService.deleteLanguage(id);
      return ok(res, 'Xóa ngôn ngữ thành công');
    } catch (err) {
      if (err.statusCode == 404) { return notFound(res, err.message); }
      if (err.statusCode == 409) { return conflict(res, err.message); }
      return error(res, err.message);
    }
  }
}

module.exports = new LanguageController(); 