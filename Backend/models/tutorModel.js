const { DataTypes } = require("sequelize");
const sequelize = require("../config/Database");

const Tutor = sequelize.define("Tutor", {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  name: { type: DataTypes.STRING, allowNull: false },
  email: { type: DataTypes.STRING, allowNull: false, unique: true },
  password: { type: DataTypes.STRING, allowNull: false },
});

module.exports = Tutor;
