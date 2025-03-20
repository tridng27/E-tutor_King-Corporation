const { DataTypes } = require("sequelize");
const sequelize = require("../config/Database");
const User = require("./user");

const Student = sequelize.define("Student", {
  StudentID: {
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
  Role: {
    type: DataTypes.CHAR(20),
    allowNull: false
  }
}, {
  tableName: "Student",
  timestamps: false
});

// Quan hệ 1-1 với User
User.hasOne(Student, { foreignKey: "UserID" });
Student.belongsTo(User, { foreignKey: "UserID" });

module.exports = Student;
