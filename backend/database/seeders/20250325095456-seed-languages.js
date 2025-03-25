'use strict';

const { faker } = require('@faker-js/faker/locale/vi');

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    const isDevelopment = process.env.DATABASE_ENV === 'development';
    
    // Tạo dữ liệu cho bảng languages
    const languagesData = isDevelopment 
      ? [
          { id: 1, locale: 'vi', name: 'Tiếng Việt', is_active: true },
          { id: 2, locale: 'en', name: 'English', is_active: true },
          { id: 3, locale: 'fr', name: 'Français', is_active: true },
          { id: 4, locale: 'de', name: 'Deutsch', is_active: true },
          { id: 5, locale: 'es', name: 'Español', is_active: true },
          { id: 6, locale: 'ja', name: '日本語', is_active: false },
          { id: 7, locale: 'zh', name: '中文', is_active: false }
        ]
      : [
          { id: 1, locale: 'vi', name: 'Tiếng Việt', is_active: true },
          { id: 2, locale: 'en', name: 'English', is_active: true }
        ];
    
    await queryInterface.bulkInsert('languages', languagesData);
    console.log(`Seeded languages table (${isDevelopment ? 'development' : 'test'} environment) successfully!`);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('languages', null, {});
  }
};
