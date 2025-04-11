const languageService = require('../services/languageService');
const { ok, created, notFound, error, customError } = require('../../../utils/responseUtils');

class LanguageController {
  /**
   * GET /languages
   * -----------------------------
   * @desc    Lấy danh sách ngôn ngữ
   * @access  User, Blogger, Admin
   */
  async getAllLanguages(req, res) {
    try {
      const languages = await languageService.getAllLanguages();
      return ok(res, languages);
    } catch (err) {
      return error(res, err.message);
    }
  }

  /**
   * GET /languages/:id
   * -----------------------------
   * @desc    Lấy thông tin một ngôn ngữ
   * @access  User, Blogger, Admin
   */
  async getLanguageById(req, res) {
    try {
      const { id } = req.params;
      const language = await languageService.getLanguageById(id);
      return ok(res, language);
    } catch (err) {
      if (err.message === 'Không tìm thấy ngôn ngữ') {
        return notFound(res, err.message);
      }
      return error(res, err.message);
    }
  }

  /**
   * POST /languages
   * -----------------------------
   * @desc    Tạo ngôn ngữ mới
   * @access  Admin
   */
  async createLanguage(req, res) {
    try {
      const language = await languageService.createLanguage(req.body);
      return created(res, language, 'Tạo ngôn ngữ thành công');
    } catch (err) {
      if (err.message === 'Locale đã tồn tại') {
        return customError(res, 409, err.message);
      }
      return error(res, err.message);
    }
  }

  /**
   * PUT /languages/:id
   * -----------------------------
   * @desc    Cập nhật ngôn ngữ
   * @access  Admin
   */
  async updateLanguage(req, res) {
    try {
      const { id } = req.params;
      const language = await languageService.updateLanguage(id, req.body);
      return ok(res, language, 'Cập nhật ngôn ngữ thành công');
    } catch (err) {
      if (err.message === 'Không tìm thấy ngôn ngữ') {
        return notFound(res, err.message);
      }
      if (err.message === 'Locale đã tồn tại') {
        return customError(res, 409, err.message);
      }
      return error(res, err.message);
    }
  }

  /**
  * DELETE /languages/:id
   * -----------------------------
   * @desc    Xóa ngôn ngữ
   * @access  Admin
   */
  async deleteLanguage(req, res) {
    try {
      const { id } = req.params;
      await languageService.deleteLanguage(id);
      return ok(res, null, 'Xóa ngôn ngữ thành công');
    } catch (err) {
      if (err.message === 'Không tìm thấy ngôn ngữ') {
        return notFound(res, err.message);
      }
      if (err.message === 'Không thể xóa ngôn ngữ vì đang có bài viết sử dụng') {
        return customError(res, 409, err.message);
      }
      return error(res, err.message);
    }
  }
}

module.exports = new LanguageController(); 