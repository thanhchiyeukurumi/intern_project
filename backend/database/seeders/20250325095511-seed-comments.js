'use strict';

const { faker } = require('@faker-js/faker/locale/vi');

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    const isDevelopment = process.env.DATABASE_ENV === 'development';
    
    // Tạo dữ liệu cho bảng comments
    const commentsData = isDevelopment 
      ? [
          // Tạo một số bình luận cố định
          {
            id: 1,
            user_id: 2, // user
            post_id: 1,
            content: 'Bài viết rất hữu ích, cảm ơn tác giả!',
            created_at: faker.date.past({ years: 1 }),
            updated_at: null
          },
          {
            id: 2,
            user_id: 3, // blogger
            post_id: 1,
            content: 'Tôi đang tìm hiểu về React Native, bài viết này giúp ích cho tôi rất nhiều.',
            created_at: faker.date.past({ years: 1 }),
            updated_at: null
          },
          // Tạo thêm bình luận ngẫu nhiên
          ...Array(10).fill().map((_, index) => {
            // Đảm bảo user_id và post_id là hợp lệ
            const userId = Math.min(Math.ceil(Math.random() * 10), 10);
            const postId = Math.min(Math.ceil(Math.random() * 10), 10);
            const createdAt = faker.date.past({ months: 6 });
            
            return {
              id: index + 3,
              user_id: userId,
              post_id: postId,
              content: faker.lorem.paragraph(),
              created_at: createdAt,
              updated_at: Math.random() > 0.8 ? faker.date.between({ from: createdAt, to: new Date() }) : null
            };
          })
        ]
      : [
          // Dữ liệu tối thiểu cho môi trường test
          {
            id: 1,
            user_id: 2, // testuser
            post_id: 1,
            content: 'Test comment for the first post',
            created_at: new Date(),
            updated_at: null
          },
          {
            id: 2,
            user_id: 3, // testblogger
            post_id: 2,
            content: 'Test comment for the second post',
            created_at: new Date(),
            updated_at: null
          }
        ];
    
    try {
      await queryInterface.bulkInsert('comments', commentsData);
      console.log(`Seeded comments table (${isDevelopment ? 'development' : 'test'} environment) successfully!`);
    } catch (error) {
      console.error('Lỗi khi seed comments:', error.message);
      if (isDevelopment) {
        console.error('Chi tiết lỗi:', error);
      }
      throw error;
    }
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('comments', null, {});
  }
};
