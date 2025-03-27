const Sequelize = require('sequelize');
const slugify = require('slugify');

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
      allowNull: true,
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
    ],
    hooks: {
      /**
       * Hook tự động tạo slug từ title trước khi validate
       */
      beforeValidate: async (post) => {
        if (!post.slug && post.title) {
          post.slug = await createUniqueSlug(post, sequelize);
        }
      },
      
      /**
       * Hook tự động cập nhật slug khi title thay đổi
       */
      beforeUpdate: async (post) => {
        if (post.changed('title') && !post.changed('slug')) {
          post.slug = await createUniqueSlug(post, sequelize);
        }
      }
    }
  });

  /**
   * Hàm tạo slug duy nhất từ title
   * @param {Object} post - Đối tượng post
   * @param {Object} sequelize - Instance sequelize
   * @returns {string} - Slug duy nhất
   */
  async function createUniqueSlug(post, sequelize) {
    // Tạo slug cơ bản từ title
    let baseSlug = slugify(post.title, {
      lower: true,       // Chuyển thành chữ thường
      strict: true,      // Loại bỏ các ký tự không phù hợp
      locale: 'vi',      // Hỗ trợ ngôn ngữ tiếng Việt
      trim: true         // Xóa khoảng trắng ở đầu và cuối
    });
    
    // Đảm bảo độ dài slug không vượt quá 120 ký tự (giới hạn của cột)
    if (baseSlug.length > 120) {
      baseSlug = baseSlug.substring(0, 120);
    }
    
    // Kiểm tra xem slug đã tồn tại chưa và đảm bảo tính duy nhất
    let slug = baseSlug;
    let counter = 0;
    let slugExists = true;
    
    while (slugExists) {
      // Nếu counter > 0, thêm số vào cuối slug
      if (counter > 0) {
        // Cắt ngắn baseSlug để đảm bảo slug + counter không vượt quá 120 ký tự
        const counterStr = `-${counter}`;
        const maxBaseLength = 120 - counterStr.length;
        
        if (baseSlug.length > maxBaseLength) {
          baseSlug = baseSlug.substring(0, maxBaseLength);
        }
        
        slug = `${baseSlug}${counterStr}`;
      }
      
      // Kiểm tra xem slug đã tồn tại trong database chưa
      const where = { slug: slug };
      
      // Nếu là update, loại trừ post hiện tại
      if (post.id) {
        where.id = { [Sequelize.Op.ne]: post.id };
      }
      
      const existingPost = await sequelize.models.Post.findOne({ where });
      
      if (!existingPost) {
        slugExists = false;
      } else {
        counter += 1;
      }
    }
    
    return slug;
  }

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
