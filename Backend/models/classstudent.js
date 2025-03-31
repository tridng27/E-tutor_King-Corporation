const { DataTypes } = require("sequelize");
const sequelize = require("../config/Database");
const Class = require("./class");
const Student = require("./student");

const ClassStudent = sequelize.define("ClassStudent", {
  ClassStudentID: {
    type: DataTypes.BIGINT,
    primaryKey: true,
    autoIncrement: true
  },
  ClassID: {
    type: DataTypes.BIGINT,
    allowNull: false,
    references: {
      model: Class,
      key: "ClassID"
    },
    onDelete: "CASCADE"
  },
  StudentID: {
    type: DataTypes.BIGINT,
    allowNull: false,
    references: {
      model: Student,
      key: "StudentID"
    },
    onDelete: "CASCADE"
  }
}, {
  tableName: "ClassStudent",
  timestamps: false
});

// Thiết lập quan hệ nhiều-nhiều giữa Class và Student thông qua ClassStudent
Class.belongsToMany(Student, { through: ClassStudent, foreignKey: "ClassID" });
Student.belongsToMany(Class, { through: ClassStudent, foreignKey: "StudentID" });

module.exports = ClassStudent;
