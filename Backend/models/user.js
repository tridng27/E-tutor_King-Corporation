const { DataTypes } = require("sequelize");
const sequelize = require("../config/Database");

const User = sequelize.define("User", {
  UserID: {
    type: DataTypes.BIGINT,
    primaryKey: true,
    autoIncrement: true
  },
  Email: {
    type: DataTypes.STRING(255),
    allowNull: false,
    unique: true
  },
  Password: {
    type: DataTypes.STRING(255),
    allowNull: false
  },
  Name: {
    type: DataTypes.STRING(255),
    allowNull: false
  },
  Birthdate: {
    type: DataTypes.DATE,
    allowNull: true
  },
  Gender: {
    type: DataTypes.ENUM("Male", "Female", "Other"),
    allowNull: true
  },
  // Hoặc để null/pending nếu cần
  Role: {
    type: DataTypes.ENUM("Admin", "Tutor", "Student"),
    allowNull: true
  },
  RegisterDate: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW
  }
}, {
  tableName: "User",
  timestamps: false
});

module.exports = User;
