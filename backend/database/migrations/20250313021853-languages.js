'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('languages', {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true
      },
      locale: {
        type: Sequelize.STRING(5),
        allowNull: false,
        unique: true
      },
      name: {
        type: Sequelize.STRING(50),
        allowNull: false
      },
      is_active: {
        type: Sequelize.BOOLEAN,
        defaultValue: true
      }
    });
  },

  async down(queryInterface) {
    await queryInterface.dropTable('languages');
  }
};