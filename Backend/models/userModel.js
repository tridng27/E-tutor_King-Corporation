const { DataTypes } = require("sequelize");
const sequelize = require("../config/Database");

const User = sequelize.define("User", {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  email: { type: DataTypes.STRING(50), allowNull: false, unique: true },
  password: { type: DataTypes.STRING(255), allowNull: false },
  name: { type: DataTypes.STRING(50), allowNull: false },
  birthdate: { type: DataTypes.DATEONLY },
  enrollDate: { type: DataTypes.DATEONLY },
  userType: { 
    type: DataTypes.ENUM("student", "tutor", "admin"), 
    allowNull: false 
  },
});

module.exports = User;
