'use strict';

const { faker } = require('@faker-js/faker/locale/vi');

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    const isDevelopment = process.env.DATABASE_ENV === 'development';
    
    // Tạo dữ liệu cho bảng roles
    const rolesData = isDevelopment
      ? [
          { id: 1, name: 'admin' },
          { id: 2, name: 'editor' },
          { id: 3, name: 'user' },
          { id: 4, name: 'guest' },
          { id: 5, name: 'moderator' },
          { id: 6, name: 'blogger' }
        ]
      : [
          { id: 1, name: 'admin' },
          { id: 2, name: 'user' },
          { id: 3, name: 'blogger' }
        ];
    
    try {
      await queryInterface.bulkInsert('roles', rolesData);
      console.log(`Seeded roles table (${isDevelopment ? 'development' : 'test'} environment) successfully!`);
    } catch (error) {
      console.error('Lỗi khi seed roles:', error.message);
      throw error;
    }
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('roles', null, {});
  }
};
