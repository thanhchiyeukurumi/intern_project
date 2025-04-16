const db = require('models');
const { Language, Post } = db;
const { Sequelize } = require('sequelize');

class LanguageService {
  // ============================================ 
  // LẤY DANH SÁCH NGÔN NGỮ - getAllLanguages    
  // ============================================
  /** 
   * Get all languages  
   * @param {Object} options - Options for the query
   * @param {string} options.orderBy - The field to order by
   * @param {string} options.order - The order direction
   * @returns {Promise<Object>} - A promise that resolves to an object containing the languages and pagination information
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

  // ============================================
  // LẤY THÔNG TIN MỘT NGÔN NGỮ - getLanguageById
  // ============================================
  /** 
   * Get language by ID
   * @param {number} id - The ID of the language
   * @returns {Promise<Object>} - A promise that resolves to the language object
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

  // ============================================
  // TẠO NGÔN NGỮ MỚI - createLanguage
  // ============================================
  /** 
   * Create a new language
   * @param {Object} data - The data for the new language
   * @returns {Promise<Object>} - A promise that resolves to the new language object
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

  // ============================================
  // CẬP NHẬT NGÔN NGỮ - updateLanguage
  // ============================================
  /** 
   * Update a language
   * @param {number} id - The ID of the language
   * @param {Object} data - The data for the updated language
   * @returns {Promise<Object>} - A promise that resolves to the updated language object
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

  // ============================================
  // XÓA NGÔN NGỮ - deleteLanguage
  // ============================================
  /** 
   * Delete a language
   * @param {number} id - The ID of the language
   * @returns {Promise<Object>} - A promise that resolves to the deleted language object
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