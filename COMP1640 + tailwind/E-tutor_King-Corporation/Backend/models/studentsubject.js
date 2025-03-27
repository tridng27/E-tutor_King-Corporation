const { DataTypes } = require("sequelize");
const sequelize = require("../config/Database");
const Student = require("./student");
const Subject = require("./subject");

const StudentSubject = sequelize.define("StudentSubject", {
  StudentSubjectID: {
    type: DataTypes.BIGINT,
    primaryKey: true,
    autoIncrement: true
  },
  StudentID: {
    type: DataTypes.BIGINT,
    allowNull: false,
    references: {
      model: "Student", 
      key: "StudentID"
    }
  },
  SubjectID: {
    type: DataTypes.BIGINT,
    allowNull: false,
    references: {
      model: "Subject", 
      key: "SubjectID"
    }
  },
  Score: {
    type: DataTypes.FLOAT,
    allowNull: true,
    validate: {
      min: 0,
      max: 100
    }
  },
  Attendance: {
    type: DataTypes.FLOAT,
    allowNull: true,
    validate: {
      min: 0,
      max: 100
    }
  }
}, {
  tableName: "StudentSubject",
  timestamps: false
});

// Xác định quan hệ đúng
Student.hasMany(StudentSubject, { foreignKey: "StudentID" });
StudentSubject.belongsTo(Student, { foreignKey: "StudentID" });

Subject.hasMany(StudentSubject, { foreignKey: "SubjectID" });
StudentSubject.belongsTo(Subject, { foreignKey: "SubjectID" });

module.exports = StudentSubject;
