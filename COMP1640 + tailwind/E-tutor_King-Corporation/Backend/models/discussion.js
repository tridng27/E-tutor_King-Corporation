const { DataTypes } = require("sequelize");
const sequelize = require("../config/Database");
const Tutor = require("./tutor");

const Discussion = sequelize.define("Discussion", {
  DiscID: {
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
  Title: {
    type: DataTypes.STRING(255),
    allowNull: false
  },
  Description: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  CreatedDate: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  }
}, {
  tableName: "Discussion",
  timestamps: false
});

Tutor.hasMany(Discussion, { foreignKey: "TutorID" });
Discussion.belongsTo(Tutor, { foreignKey: "TutorID" });

module.exports = Discussion;
