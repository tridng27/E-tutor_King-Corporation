const { DataTypes } = require("sequelize");
const sequelize = require("../config/Database");
const User = require("./user");

const Admin = sequelize.define("Admin", {
  AdminID: {
    type: DataTypes.BIGINT,
    primaryKey: true,
    autoIncrement: true
  },
  UserID: {
    type: DataTypes.BIGINT,
    allowNull: false,
    unique: true,
    references: {
      model: User,
      key: "UserID"
    }
  },
  Supervision: {
    type: DataTypes.CHAR(50),
    allowNull: false
  }
}, {
  tableName: "Admin",
  timestamps: false
});

// Quan hệ 1-1 với User
User.hasOne(Admin, { foreignKey: "UserID" });
Admin.belongsTo(User, { foreignKey: "UserID" });

module.exports = Admin;
