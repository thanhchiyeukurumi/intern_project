'use strict';

const { faker } = require('@faker-js/faker/locale/vi');

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    const isDevelopment = process.env.DATABASE_ENV === 'development';
    
    // Tạo dữ liệu cho bảng categories
    const categoriesData = isDevelopment 
      ? [
          // Danh mục chính
          { id: 1, name: 'Công nghệ', parent_id: null },
          { id: 2, name: 'Giáo dục', parent_id: null },
          { id: 3, name: 'Giải trí', parent_id: null },
          // Danh mục con của Công nghệ
          { id: 4, name: 'Phần mềm', parent_id: 1 },
          { id: 5, name: 'Phần cứng', parent_id: 1 },
          { id: 6, name: 'Trí tuệ nhân tạo', parent_id: 1 },
          // Danh mục con của Giáo dục
          { id: 7, name: 'Đại học', parent_id: 2 },
          { id: 8, name: 'Giáo dục phổ thông', parent_id: 2 },
          // Danh mục con của Giải trí
          { id: 9, name: 'Âm nhạc', parent_id: 3 },
          { id: 10, name: 'Phim ảnh', parent_id: 3 },
        ]
      : [
          // Dữ liệu tối thiểu cho môi trường test
          { id: 1, name: 'Technology', parent_id: null },
          { id: 2, name: 'Education', parent_id: null },
          { id: 3, name: 'Software', parent_id: 1 },
          { id: 4, name: 'University', parent_id: 2 }
        ];
    
    await queryInterface.bulkInsert('categories', categoriesData);
    console.log(`Seeded categories table (${isDevelopment ? 'development' : 'test'} environment) successfully!`);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('categories', null, {});
  }
};
