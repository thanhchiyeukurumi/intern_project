const Sequelize = require('sequelize');
module.exports = function(sequelize, DataTypes) {
  const Role = sequelize.define('Role', {
    id: {
      autoIncrement: true,
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true
    },
    name: {
      type: DataTypes.STRING(50),
      allowNull: false
    }
  }, {
    sequelize,
    tableName: 'roles',
    modelName: 'Role',
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
    ]
  });

  Role.associate = (models) => {
    Role.hasMany(models.User, { foreignKey: "role_id" });
  };

  return Role;
};
