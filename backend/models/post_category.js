const Sequelize = require('sequelize');
module.exports = function(sequelize, DataTypes) {
  const PostCategory = sequelize.define('PostCategory', {
    post_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'posts',
        key: 'id'
      },
      onUpdate: 'CASCADE',
      onDelete: 'CASCADE'
    },
    category_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'categories',
        key: 'id'
      },
      onUpdate: 'CASCADE',
      onDelete: 'CASCADE'
    }
  }, {
    sequelize,
    tableName: 'post_categories',
    modelName: 'PostCategory',
    timestamps: false,
    indexes: [
      {
        name: "post_categories_post_id_category_id_uk",
        unique: true,
        using: "BTREE",
        fields: [
          { name: "post_id" },
          { name: "category_id" },
        ]
      },
      {
        name: "post_categories_post_id",
        using: "BTREE",
        fields: [
          { name: "post_id" },
        ]
      },
      {
        name: "post_categories_category_id",
        using: "BTREE",
        fields: [
          { name: "category_id" },
        ]
      },
    ]
  });

  PostCategory.associate = (models) => {
    // Bảng trung gian nên có mối quan hệ với cả Post và Category
    PostCategory.belongsTo(models.Post, { foreignKey: "post_id", as: "post" });
    PostCategory.belongsTo(models.Category, { foreignKey: "category_id", as: "category" });
  };
  
  return PostCategory;
};
