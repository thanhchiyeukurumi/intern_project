'use strict';

const { faker } = require('@faker-js/faker/locale/vi');
const slugify = require('slugify');

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    const isDevelopment = process.env.DATABASE_ENV === 'development';
    
    // Tạo dữ liệu cho bảng categories
    const categoriesData = isDevelopment 
      ? [
          // Danh mục chính
          { id: 1, name: 'Công nghệ', parent_id: null, slug: 'cong-nghe' },
          { id: 2, name: 'Giáo dục', parent_id: null, slug: 'giao-duc' },
          { id: 3, name: 'Giải trí', parent_id: null, slug: 'giai-tri' },
          // Danh mục con của Công nghệ
          { id: 4, name: 'Phần mềm', parent_id: 1, slug: 'phan-mem' },
          { id: 5, name: 'Phần cứng', parent_id: 1, slug: 'phan-cung' },
          { id: 6, name: 'Trí tuệ nhân tạo', parent_id: 1, slug: 'tri-tue-nhan-tao' },
          // Danh mục con của Giáo dục
          { id: 7, name: 'Đại học', parent_id: 2, slug: 'dai-hoc' },
          { id: 8, name: 'Giáo dục phổ thông', parent_id: 2, slug: 'giao-duc-pho-thong' },
          // Danh mục con của Giải trí
          { id: 9, name: 'Âm nhạc', parent_id: 3, slug: 'am-nhac' },
          { id: 10, name: 'Phim ảnh', parent_id: 3, slug: 'phim-anh' },
        ]
      : [
          // Dữ liệu tối thiểu cho môi trường test
          { id: 1, name: 'Technology', parent_id: null, slug: 'technology' },
          { id: 2, name: 'Education', parent_id: null, slug: 'education' },
          { id: 3, name: 'Software', parent_id: 1, slug: 'software' },
          { id: 4, name: 'University', parent_id: 2, slug: 'university' }
        ];
    
    await queryInterface.bulkInsert('categories', categoriesData);
    console.log(`Seeded categories table (${isDevelopment ? 'development' : 'test'} environment) successfully!`);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('categories', null, {});
  }
};
