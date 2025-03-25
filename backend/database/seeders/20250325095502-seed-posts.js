'use strict';

const { faker } = require('@faker-js/faker/locale/vi');
const slugify = require('slugify');

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    const isDevelopment = process.env.DATABASE_ENV === 'development';
    
    // Tạo dữ liệu cho bảng posts
    const postsData = isDevelopment 
      ? [
          // Tạo một số bài viết cố định
          {
            id: 1,
            user_id: 3, // blogger
            abstract: 'Tổng quan về React Native',
            title: 'Hướng dẫn React Native cho người mới bắt đầu',
            content: 'React Native là một framework phát triển ứng dụng di động đa nền tảng được Facebook phát triển. ' + faker.lorem.paragraphs(5),
            description: 'Bài viết hướng dẫn chi tiết về React Native dành cho những người mới bắt đầu',
            slug: 'huong-dan-react-native-cho-nguoi-moi-bat-dau',
            views: 1250,
            language_id: 1,
            original_post_id: null,
            created_at: faker.date.past({ years: 1 }),
            updated_at: faker.date.recent()
          },
          {
            id: 2,
            user_id: 3, // blogger
            abstract: 'React Native Guide',
            title: 'React Native Guide for Beginners',
            content: 'React Native is a cross-platform mobile app development framework developed by Facebook. ' + faker.lorem.paragraphs(5),
            description: 'A detailed guide on React Native for beginners',
            slug: 'react-native-guide-for-beginners',
            views: 980,
            language_id: 2,
            original_post_id: 1,
            created_at: faker.date.past({ years: 1 }),
            updated_at: faker.date.recent()
          },
          // Tạo thêm bài viết ngẫu nhiên
          ...Array(8).fill().map((_, index) => {
            // Đảm bảo user_id là hợp lệ (từ 1 đến 10)
            const userId = Math.min(Math.ceil(Math.random() * 10), 10);
            const langId = Math.random() > 0.5 ? 1 : 2;
            const title = faker.lorem.sentence(5);
            const slug = slugify(title, { lower: true, strict: true });
            const createdAt = faker.date.past({ years: 1 });
            
            return {
              id: index + 3,
              user_id: userId,
              abstract: faker.lorem.sentence(),
              title: title,
              content: faker.lorem.paragraphs(5),
              description: faker.lorem.paragraph(),
              slug: slug,
              views: Math.floor(Math.random() * 3000),
              language_id: langId,
              original_post_id: Math.random() > 0.8 ? Math.ceil(Math.random() * (index + 2)) : null,
              created_at: createdAt,
              updated_at: faker.date.between({ from: createdAt, to: new Date() })
            };
          })
        ]
      : [
          // Dữ liệu tối thiểu cho môi trường test
          {
            id: 1,
            user_id: 3, // testblogger
            abstract: 'Test Post',
            title: 'Test Post Title',
            content: 'This is a test post content...',
            description: 'Test post description',
            slug: 'test-post-title',
            views: 100,
            language_id: 1,
            original_post_id: null,
            created_at: new Date(),
            updated_at: new Date()
          },
          {
            id: 2,
            user_id: 2, // testuser
            abstract: 'Another Test Post',
            title: 'Another Test Post Title',
            content: 'This is another test post content...',
            description: 'Another test post description',
            slug: 'another-test-post-title',
            views: 50,
            language_id: 2,
            original_post_id: null,
            created_at: new Date(),
            updated_at: new Date()
          }
        ];
    
    try {
      await queryInterface.bulkInsert('posts', postsData);
      console.log(`Seeded posts table (${isDevelopment ? 'development' : 'test'} environment) successfully!`);
    } catch (error) {
      console.error('Lỗi khi seed posts:', error.message);
      if (isDevelopment) {
        console.error('Chi tiết lỗi:', error);
      }
      throw error;
    }
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('posts', null, {});
  }
};
