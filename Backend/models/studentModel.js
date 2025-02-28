const { DataTypes } = require("sequelize");
const sequelize = require("../config/Database");

const Student = sequelize.define("Student", {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  name: { type: DataTypes.STRING, allowNull: false },
  email: { type: DataTypes.STRING, allowNull: false, unique: true },
  password: { type: DataTypes.STRING, allowNull: false },
  tutorId: { type: DataTypes.INTEGER, allowNull: true }, // Liên kết với Tutor
});

module.exports = Student;
