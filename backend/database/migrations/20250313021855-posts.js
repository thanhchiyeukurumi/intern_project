'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('posts', {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true
      },
      user_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'users',
          key: 'id'
        }
      },
      abstract: {
        type: Sequelize.STRING(100),
        allowNull: false
      },
      title: {
        type: Sequelize.STRING(100),
        allowNull: false
      },
      content: {
        type: Sequelize.TEXT('long'),
        allowNull: false
      },
      description: {
        type: Sequelize.TEXT('long'),
        allowNull: false
      },
      slug: {
        type: Sequelize.STRING(120),
        allowNull: false,
        unique: true
      },
      views: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 0
      },
      language_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'languages',
          key: 'id'
        }
      },
      original_post_id: {
        type: Sequelize.INTEGER,
        references: {
          model: 'posts',
          key: 'id'
        }
      },
      created_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      },
      updated_at: {
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      }
    });

    await queryInterface.addIndex('posts', ['user_id']);
    await queryInterface.addIndex('posts', ['slug']);
    await queryInterface.addIndex('posts', ['views']);
  },

  async down(queryInterface) {
    await queryInterface.dropTable('posts');
  }
};