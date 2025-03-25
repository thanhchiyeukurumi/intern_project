'use strict';

const { faker } = require('@faker-js/faker/locale/vi');
const bcrypt = require('bcryptjs');

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    const isDevelopment = process.env.DATABASE_ENV === 'development';
    
    // Tạo mật khẩu mã hóa
    const hashedPassword = await bcrypt.hash('password123', 10);
    
    // Tạo dữ liệu cho bảng users
    const usersData = isDevelopment 
      ? [
          // Người dùng cố định
          { 
            id: 1, 
            username: 'admin', 
            fullname: 'Administrator', 
            password: hashedPassword,
            email: 'admin@example.com', 
            description: 'Quản trị viên hệ thống',
            role_id: 1,
            created_at: new Date(),
            updated_at: new Date()
          },
          { 
            id: 2, 
            username: 'user', 
            fullname: 'User', 
            password: hashedPassword,
            email: 'user@example.com', 
            description: 'User',
            role_id: 2,
            created_at: new Date(),
            updated_at: new Date()
          },
          { 
            id: 3, 
            username: 'blogger', 
            fullname: 'Blogger', 
            password: hashedPassword,
            email: 'blogger@example.com', 
            description: 'Blogger',
            role_id: 3,
            created_at: new Date(),
            updated_at: new Date()
          },
          // Tạo 7 người dùng ngẫu nhiên khác (tổng cộng 10 người dùng)
          ...Array(7).fill().map((_, index) => ({
            id: index + 4, // Bắt đầu từ id=4
            username: `user${index + 4}`,
            fullname: faker.person.fullName(),
            password: hashedPassword,
            email: faker.internet.email(),
            description: faker.lorem.paragraph(),
            role_id: Math.floor(Math.random() * 2) + 2,
            created_at: faker.date.past(),
            updated_at: faker.date.recent()
          }))
        ]
      : [
          { 
            id: 1, 
            username: 'testadmin', 
            fullname: 'Test Admin', 
            password: hashedPassword,
            email: 'testadmin@example.com', 
            description: 'Test Admin User',
            role_id: 1,
            created_at: new Date(),
            updated_at: new Date()
          },
          { 
            id: 2, 
            username: 'testuser', 
            fullname: 'Test User', 
            password: hashedPassword,
            email: 'testuser@example.com', 
            description: 'Test Normal User',
            role_id: 2,
            created_at: new Date(),
            updated_at: new Date()
          },
          { 
            id: 3, 
            username: 'testblogger', 
            fullname: 'Test Blogger', 
            password: hashedPassword,
            email: 'testblogger@example.com', 
            description: 'Test Blogger User',
            role_id: 3,
            created_at: new Date(),
            updated_at: new Date()
          }
        ];
    
    try {
      await queryInterface.bulkInsert('users', usersData);
      console.log(`Seeded users table (${isDevelopment ? 'development' : 'test'} environment) successfully!`);
    } catch (error) {
      console.error('Lỗi khi seed users:', error.message);
      if (isDevelopment) {
        console.error('Chi tiết lỗi:', error);
      }
      throw error;
    }
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('users', null, {});
  }
};
