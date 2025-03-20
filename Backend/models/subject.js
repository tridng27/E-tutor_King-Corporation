const { DataTypes } = require("sequelize");
const sequelize = require("../config/Database");
const Class = require("./class");

const Subject = sequelize.define("Subject", {
  SubjectID: {
    type: DataTypes.BIGINT,
    primaryKey: true,
    autoIncrement: true
  },
  ClassID: {
    type: DataTypes.BIGINT,
    allowNull: true,
    references: {
      model: Class,
      key: "ClassID"
    }
  },
  SubjectName: {
    type: DataTypes.STRING(255),
    allowNull: false
  },
  Teacher: {
    type: DataTypes.STRING(255),
    allowNull: true
  },
  Feedback: {
    type: DataTypes.CHAR(255),
    allowNull: true
  }
}, {
  tableName: "Subject",
  timestamps: false
});

Class.hasMany(Subject, { foreignKey: "ClassID" });
Subject.belongsTo(Class, { foreignKey: "ClassID" });

module.exports = Subject;
