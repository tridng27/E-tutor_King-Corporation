const { DataTypes } = require("sequelize");
const sequelize = require("../config/Database");
const Class = require("./class");

const Timetable = sequelize.define("Timetable", {
  TimetableID: {
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
  TimetableDate: {
    type: DataTypes.DATE,
    allowNull: false
  },
  TimetableLocation: {
    type: DataTypes.STRING(255),
    allowNull: true
  },
  TimetableSchedule: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  }
}, {
  tableName: "Timetable",
  timestamps: false
});

Class.hasMany(Timetable, { foreignKey: "ClassID" });
Timetable.belongsTo(Class, { foreignKey: "ClassID" });

module.exports = Timetable;
