const db = require('models');
const { Language, Post } = db;
const { Sequelize } = require('sequelize');

class LanguageService {
  /**
   * Lấy danh sách ngôn ngữ
   */
  async getAllLanguages(options = {}) {
    try {
      const page = 1;
      const limit = 1000;
      const orderBy = options.orderBy || 'id';
      const order = options.order || 'ASC';

      const offset = (page - 1) * limit;
      
      const queryOptions = {
        where: {},
        order: [[orderBy, order]],
        limit,
        offset,
        attributes: { exclude: ['createdAt', 'updatedAt'] }
      };

      const { count, rows } = await Language.findAndCountAll(queryOptions);

      return {
        data: rows,
        pagination: {
          total: count,
          page,
          limit,
          totalPages: Math.ceil(count / limit)
        }
      };
    } catch (err) {
      throw err;
    }
  }

  /**
   * Lấy thông tin một ngôn ngữ
   */
  async getLanguageById(id) {
    try {
      const language = await Language.findByPk(id, {
        attributes: { exclude: ['createdAt', 'updatedAt'] }
      }); 
      if (!language) {
        const error = new Error('Không tìm thấy ngôn ngữ');
        error.statusCode = 404;
        throw error;
      }
      return language;
    } catch (err) {
      throw err;
    }
  }

  /**
   * Tạo ngôn ngữ mới
   */
  async createLanguage(data) {
    const transaction = await db.sequelize.transaction();
    try {
      const languageName = data.name;
      const existingLanguage = await Language.findOne({
        where: { name: languageName },
        transaction
      });
      if (existingLanguage) {
        const error = new Error('Tên ngôn ngữ đã tồn tại');
        error.statusCode = 409;
        throw error;
      }
      const language = await Language.create({
        name: languageName,
        locale: data.locale,
        is_active: data.is_active
      }, { transaction });
      await transaction.commit();
      return language;
    } catch (err) {
      await transaction.rollback();
      if (transaction && !transaction.finished) {
        await transaction.rollback();
    }
      throw err;
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
        const error = new Error('Không tìm thấy ngôn ngữ');
        error.statusCode = 404;
        throw error;
      }
      const existingLanguage = await Language.findOne({
        where: { name: data.name },
        transaction
      });
      if (existingLanguage) {
        const error = new Error('Tên ngôn ngữ đã tồn tại');
        error.statusCode = 409;
        throw error;
      }
      await language.update(data, { transaction });
      await transaction.commit();
      return language;
    } catch (err) {
      await transaction.rollback();
      if (transaction && !transaction.finished) {
        await transaction.rollback();
      }
      throw err;
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
        const error = new Error('Không tìm thấy ngôn ngữ');
        error.statusCode = 404;
        throw error;
      }

      // Kiểm tra xem ngôn ngữ có đang được sử dụng không
      const postCount = await Post.count({
        where: { language_id: id },
        transaction
      });

      if (postCount > 0) {
        const error = new Error('Không thể xóa ngôn ngữ vì đang có bài viết sử dụng');
        error.statusCode = 409;
        throw error;
      }

      await language.destroy({ transaction });
      await transaction.commit();
    } catch (err) {
      await transaction.rollback();
      throw err;
    }
  }
}

module.exports = new LanguageService(); 