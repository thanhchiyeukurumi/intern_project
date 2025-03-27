const Sequelize = require('sequelize');
module.exports = function(sequelize, DataTypes) {
  const Post = sequelize.define('Post', {
    id: {
      autoIncrement: true,
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true
    },
    user_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'users',
        key: 'id'
      },
      onUpdate: 'CASCADE',
      onDelete: 'CASCADE'
    },
    abstract: {
      type: DataTypes.STRING(100),
      allowNull: false
    },
    title: {
      type: DataTypes.STRING(100),
      allowNull: false
    },
    content: {
      type: DataTypes.TEXT,
      allowNull: false
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: false
    },
    slug: {
      type: DataTypes.STRING(120),
      allowNull: false,
      unique: "slug"
    },
    views: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0
    },
    language_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'languages',
        key: 'id'
      },
      onUpdate: 'CASCADE',
      onDelete: 'CASCADE'
    },
    original_post_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'posts',
        key: 'id'
      },
      onUpdate: 'CASCADE',
      onDelete: 'CASCADE'
    }
  }, {
    sequelize,
    tableName: 'posts',
    modelName: 'Post',
    timestamps: true,
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
        name: "slug",
        unique: true,
        using: "BTREE",
        fields: [
          { name: "slug" },
        ]
      },
      {
        name: "language_id",
        using: "BTREE",
        fields: [
          { name: "language_id" },
        ]
      },
      {
        name: "original_post_id",
        using: "BTREE",
        fields: [
          { name: "original_post_id" },
        ]
      },
      {
        name: "posts_user_id",
        using: "BTREE",
        fields: [
          { name: "user_id" },
        ]
      },
      {
        name: "posts_views",
        using: "BTREE",
        fields: [
          { name: "views" },
        ]
      },
    ]
  });

  Post.associate = (models) => {
    Post.belongsTo(models.User, { foreignKey: "user_id" });
    Post.belongsTo(models.Language, { foreignKey: "language_id" });
    Post.belongsTo(models.Post, { foreignKey: "original_post_id", as: "originalPost" });
    Post.hasMany(models.Post, { foreignKey: "original_post_id", as: "translations" });
    Post.hasMany(models.Comment, { foreignKey: "post_id" });
    Post.belongsToMany(models.Category, { through: models.PostCategory, foreignKey: "post_id" });
  };
  
  return Post;
};
