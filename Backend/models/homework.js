const { DataTypes } = require("sequelize");
const sequelize = require("../config/Database");
const Subject = require("./subject");

const Homework = sequelize.define("Homework", {
  HomeworkID: {
    type: DataTypes.BIGINT,
    primaryKey: true,
    autoIncrement: true
  },
  SubjectID: {
    type: DataTypes.BIGINT,
    allowNull: true,
    references: {
      model: Subject,
      key: "SubjectID"
    }
  },
  Description: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  DueDate: {
    type: DataTypes.DATE,
    allowNull: false
  }
}, {
  tableName: "Homework",
  timestamps: false
});

Subject.hasMany(Homework, { foreignKey: "SubjectID" });
Homework.belongsTo(Subject, { foreignKey: "SubjectID" });

module.exports = Homework;
