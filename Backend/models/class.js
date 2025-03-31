const { DataTypes } = require("sequelize");
const sequelize = require("../config/Database");
const Tutor = require("./tutor");
const User = require("./user");

const Class = sequelize.define("Class", {
  ClassID: {
    type: DataTypes.BIGINT,
    primaryKey: true,
    autoIncrement: true
  },
  TutorID: {
    type: DataTypes.BIGINT,
    allowNull: true,
    references: {
      model: Tutor,
      key: "TutorID"
    }
  },
  UserID: { // Add the UserID field
    type: DataTypes.BIGINT,
    allowNull: true,
    references: {
      model: User, // Reference to the User model
      key: "UserID"
    }
  },
  Name: {
    type: DataTypes.CHAR(255),
    allowNull: false
  }
}, {
  tableName: "Class",
  timestamps: false
});

// Quan hệ n-1 với Tutor
Tutor.hasMany(Class, { foreignKey: "TutorID" });
Class.belongsTo(Tutor, { foreignKey: "TutorID" });

module.exports = Class;