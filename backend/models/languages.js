const Sequelize = require('sequelize');
module.exports = function(sequelize, DataTypes) {
  const Language = sequelize.define('Language', {
    id: {
      autoIncrement: true,
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true
    },
    locale: {
      type: DataTypes.STRING(5),
      allowNull: false,
      unique: "locale"
    },
    name: {
      type: DataTypes.STRING(50),
      allowNull: false
    },
    is_active: {
      type: DataTypes.BOOLEAN,
      allowNull: true,
      defaultValue: true
    }
  }, {
    sequelize,
    tableName: 'languages',
    modelName: 'Language',
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
        name: "locale",
        unique: true,
        using: "BTREE",
        fields: [
          { name: "locale" },
        ]
      },
    ]
  });

  Language.associate = (models) => {
    Language.hasMany(models.Post, { foreignKey: "language_id" });
  };
  
  return Language;
};
