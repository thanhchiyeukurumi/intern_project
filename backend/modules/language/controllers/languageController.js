const languageService = require('../services/languageService');
const { ok, created, notFound, error, customError } = require('../../../utils/responseUtils');

class LanguageController {
  /**
   * Lấy danh sách ngôn ngữ
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
   * Lấy thông tin một ngôn ngữ
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
   * Tạo ngôn ngữ mới
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
   * Cập nhật ngôn ngữ
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
   * Xóa ngôn ngữ
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