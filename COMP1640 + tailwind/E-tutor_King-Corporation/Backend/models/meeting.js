const { DataTypes } = require("sequelize");
const sequelize = require("../config/Database");
const Class = require("./class");

const Meeting = sequelize.define("Meeting", {
  MeetingID: {
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
  MeetingDate: {
    type: DataTypes.DATE,
    allowNull: false
  },
  MeetingLocation: {
    type: DataTypes.STRING(255),
    allowNull: true
  },
  MeetingSchedule: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  }
}, {
  tableName: "Meeting",
  timestamps: false
});

Class.hasMany(Meeting, { foreignKey: "ClassID" });
Meeting.belongsTo(Class, { foreignKey: "ClassID" });

module.exports = Meeting;
