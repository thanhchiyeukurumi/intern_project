const Sequelize = require('sequelize');
const slugify = require('slugify');

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
    slug: {
      type: DataTypes.STRING(100),
      allowNull: true,
      unique: "slug"
    },
    parent_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'categories',
        key: 'id'
      },
      onUpdate: 'CASCADE',
      onDelete: 'SET NULL'
    },
    createdAt: {
      type: DataTypes.DATE,
      field: 'created_at',
    },
    updatedAt: {
      type: DataTypes.DATE,
      field: 'updated_at',
    },
  }, {
    sequelize,
    tableName: 'categories',
    modelName: 'Category',
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
        name: "name",
        unique: true,
        using: "BTREE",
        fields: [
          { name: "name" },
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
        name: "categories_parent_id",
        using: "BTREE",
        fields: [
          { name: "parent_id" },
        ]
      },
    ],
    hooks: {
      beforeValidate: async (category) => {
        if (!category.slug && category.name) {
          category.slug = await createUniqueSlug(category, sequelize);
        }
      },
      
      beforeUpdate: async (category) => {
        if (category.changed('name') && !category.changed('slug')) {
          category.slug = await createUniqueSlug(category, sequelize);
        }
      }
    }
  });

  /**
   * Hàm tạo slug duy nhất từ name
   * @param {Object} category - Đối tượng category
   * @param {Object} sequelize - Instance sequelize
   * @returns {string} - Slug duy nhất
   */
  async function createUniqueSlug(category, sequelize) {
    // Tạo slug cơ bản từ name
    let baseSlug = slugify(category.name, {
      lower: true,       // Chuyển thành chữ thường
      strict: true,      // Loại bỏ các ký tự không phù hợp
      locale: 'vi',      // Hỗ trợ ngôn ngữ tiếng Việt
      trim: true         // Xóa khoảng trắng ở đầu và cuối
    });
    
    // Đảm bảo độ dài slug không vượt quá 100 ký tự (giới hạn của cột)
    if (baseSlug.length > 100) {
      baseSlug = baseSlug.substring(0, 100);
    }
    
    // Kiểm tra xem slug đã tồn tại chưa và đảm bảo tính duy nhất
    let slug = baseSlug;
    let counter = 0;
    let slugExists = true;
    
    while (slugExists) {
      // Nếu counter > 0, thêm số vào cuối slug
      if (counter > 0) {
        // Cắt ngắn baseSlug để đảm bảo slug + counter không vượt quá 100 ký tự
        const counterStr = `-${counter}`;
        const maxBaseLength = 100 - counterStr.length;
        
        if (baseSlug.length > maxBaseLength) {
          baseSlug = baseSlug.substring(0, maxBaseLength);
        }
        
        slug = `${baseSlug}${counterStr}`;
      }
      
      // Kiểm tra xem slug đã tồn tại trong database chưa
      const where = { slug: slug };
      
      // Nếu là update, loại trừ category hiện tại
      if (category.id) {
        where.id = { [Sequelize.Op.ne]: category.id };
      }
      
      const existingCategory = await sequelize.models.Category.findOne({ where });
      
      if (!existingCategory) {
        slugExists = false;
      } else {
        counter += 1;
      }
    }
    
    return slug;
  }

  Category.associate = (models) => {
    Category.belongsTo(models.Category, { foreignKey: "parent_id", as: "parent" });
    Category.hasMany(models.Category, { foreignKey: "parent_id", as: "children" });
    Category.belongsToMany(models.Post, { through: models.PostCategory, foreignKey: "category_id", unique: false });
  };

  return Category;
};
