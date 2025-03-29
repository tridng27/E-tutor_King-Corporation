const { DataTypes } = require("sequelize");
const sequelize = require("../config/Database");
const Tutor = require("./tutor");

const Resource = sequelize.define("Resource", {
  ResourceID: {
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
  Name: {
    type: DataTypes.STRING(255),
    allowNull: false
  },
  Description: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  FilePath: {
    type: DataTypes.STRING(255),
    allowNull: true
  },
  UploadDate: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  }
}, {
  tableName: "Resource",
  timestamps: false
});

Tutor.hasMany(Resource, { foreignKey: "TutorID" });
Resource.belongsTo(Tutor, { foreignKey: "TutorID" });

module.exports = Resource;
