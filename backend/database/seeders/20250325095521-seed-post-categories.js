'use strict';

const { faker } = require('@faker-js/faker/locale/vi');

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    const isDevelopment = process.env.DATABASE_ENV === 'development';
    
    // Phương thức để loại bỏ các mục trùng lặp
    const uniqueRelations = (relations) => {
      const seen = new Set();
      return relations.filter(item => {
        const key = `${item.post_id}-${item.category_id}`;
        if (seen.has(key)) return false;
        seen.add(key);
        return true;
      });
    };
    
    // Tạo dữ liệu cho bảng post_categories
    let postCategoriesData = isDevelopment 
      ? [
          // Liên kết cho các bài viết đầu tiên
          { post_id: 1, category_id: 1 }, // Công nghệ
          { post_id: 1, category_id: 4 }, // Phần mềm
          { post_id: 1, category_id: 6 }, // AI
          { post_id: 2, category_id: 1 }, // Technology
          { post_id: 2, category_id: 4 }, // Software
          
          // Tạo thêm liên kết ngẫu nhiên cho các bài viết khác
          ...Array(20).fill().map((_, index) => {
            // Đảm bảo mỗi bài viết có ít nhất một danh mục
            // Bài viết từ id 3 đến 15
            const postId = Math.min(3 + Math.floor(index / 2), 10);
            
            // Danh mục ngẫu nhiên
            let categoryId;
            if (index % 3 === 0) {
              // 1/3 số lượng là danh mục chính (1-3)
              categoryId = Math.ceil(Math.random() * 3);
            } else {
              // 2/3 số lượng là danh mục con (4-10) - giới hạn để tránh vượt quá số lượng danh mục
              categoryId = 3 + Math.ceil(Math.random() * 7);
            }
            
            return {
              post_id: postId,
              category_id: categoryId
            };
          })
        ]
      : [
          // Dữ liệu tối thiểu cho môi trường test
          { post_id: 1, category_id: 1 }, // Test Post - Technology
          { post_id: 1, category_id: 3 }, // Test Post - Software
          { post_id: 2, category_id: 2 }, // Another Test Post - Education
          { post_id: 2, category_id: 4 }  // Another Test Post - University
        ];
    
    // Loại bỏ các mục trùng lặp
    postCategoriesData = uniqueRelations(postCategoriesData);
    
    try {
      await queryInterface.bulkInsert('post_categories', postCategoriesData);
      console.log(`Seeded post_categories table (${isDevelopment ? 'development' : 'test'} environment) successfully!`);
    } catch (error) {
      console.error('Lỗi khi seed post_categories:', error.message);
      if (isDevelopment) {
        // Trong môi trường development, ghi lại chi tiết lỗi
        console.error('Chi tiết lỗi:', error);
        console.error('Dữ liệu gây lỗi:', JSON.stringify(postCategoriesData, null, 2));
      }
      throw error;
    }
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('post_categories', null, {});
  }
};
