'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('post_categories', {
      post_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'posts',
          key: 'id'
        }
      },
      category_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'categories',
          key: 'id'
        }
      }
    });

    await queryInterface.addIndex('post_categories', ['post_id']);
    await queryInterface.addIndex('post_categories', ['category_id']);
    await queryInterface.addConstraint('post_categories', {
      fields: ['post_id', 'category_id'],
      type: 'unique'
    });
  },

  async down(queryInterface) {
    await queryInterface.dropTable('post_categories');
  }
};