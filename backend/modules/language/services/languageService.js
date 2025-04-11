const db = require('models');
const { Language, Post } = db;
const { Sequelize } = require('sequelize');

class LanguageService {
  /**
   * Lấy danh sách ngôn ngữ
   */
  async getAllLanguages() {
    try {
      const languages = await Language.findAll({
        order: [['id', 'ASC']]
      });
      return {
        data: languages
      };
    } catch (error) {
      throw error;
    }
  }

  /**
   * Lấy thông tin một ngôn ngữ
   */
  async getLanguageById(id) {
    try {
      const language = await Language.findByPk(id);
      if (!language) {
        throw new Error('Không tìm thấy ngôn ngữ');
      }
      return language;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Tạo ngôn ngữ mới
   */
  async createLanguage(data) {
    const transaction = await db.sequelize.transaction();
    try {
      const language = await Language.create(data, { transaction });
      await transaction.commit();
      return language;
    } catch (error) {
      await transaction.rollback();
      if (error.name === 'SequelizeUniqueConstraintError') {
        throw new Error('Locale đã tồn tại');
      }
      throw error;
    }
  }

  /**
   * Cập nhật ngôn ngữ
   */
  async updateLanguage(id, data) {
    const transaction = await db.sequelize.transaction();
    try {
      const language = await Language.findByPk(id, { transaction });
      if (!language) {
        throw new Error('Không tìm thấy ngôn ngữ');
      }

      await language.update(data, { transaction });
      await transaction.commit();
      return language;
    } catch (error) {
      await transaction.rollback();
      if (error.name === 'SequelizeUniqueConstraintError') {
        throw new Error('Locale đã tồn tại');
      }
      throw error;
    }
  }

  /**
   * Xóa ngôn ngữ
   */
  async deleteLanguage(id) {
    const transaction = await db.sequelize.transaction();
    try {
      const language = await Language.findByPk(id, { transaction });
      if (!language) {
        throw new Error('Không tìm thấy ngôn ngữ');
      }

      // Kiểm tra xem ngôn ngữ có đang được sử dụng không
      const postCount = await Post.count({
        where: { language_id: id },
        transaction
      });

      if (postCount > 0) {
        throw new Error('Không thể xóa ngôn ngữ vì đang có bài viết sử dụng');
      }

      await language.destroy({ transaction });
      await transaction.commit();
      return true;
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  }
}

module.exports = new LanguageService(); 