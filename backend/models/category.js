const Sequelize = require('sequelize');
module.exports = function (sequelize, DataTypes) {
  const Category = sequelize.define('Category', {
    id: {
      autoIncrement: true,
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true
    },
    name: {
      type: DataTypes.STRING(100),
      allowNull: false,
      unique: "name"
    },
    parent_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'categories',
        key: 'id'
      }
    }
  }, {
    sequelize,
    tableName: 'categories',
    modelName: 'Category',
    timestamps: false,
    indexes: [
      {
        name: "PRIMARY",
        unique: true,
        using: "BTREE",
        fields: [
          { name: "id" },
        ]
      },
      {
        name: "name",
        unique: true,
        using: "BTREE",
        fields: [
          { name: "name" },
        ]
      },
      {
        name: "categories_parent_id",
        using: "BTREE",
        fields: [
          { name: "parent_id" },
        ]
      },
    ]
  });

  Category.associate = (models) => {
    Category.belongsTo(models.Category, { foreignKey: "parent_id", as: "parent" });
    Category.hasMany(models.Category, { foreignKey: "parent_id", as: "children" });
    Category.belongsToMany(models.Post, { through: models.PostCategory, foreignKey: "category_id", unique: false });
  };

  return Category;
};
