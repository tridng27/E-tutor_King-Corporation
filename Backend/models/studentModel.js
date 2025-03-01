const { DataTypes } = require("sequelize");
const sequelize = require("../config/Database");
const User = require("./User");

const Student = sequelize.define("Student", {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  userId: { 
    type: DataTypes.INTEGER, 
    allowNull: false,
    references: { model: User, key: "id" }
  },
  role: { type: DataTypes.STRING(25) },
});

module.exports = Student;
