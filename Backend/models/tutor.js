const { DataTypes } = require("sequelize");
const sequelize = require("../config/Database");
const User = require("./user");

const Tutor = sequelize.define("Tutor", {
  TutorID: {
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
  Fix: {
    type: DataTypes.CHAR(50),
    allowNull: false
  }
}, {
  tableName: "Tutor",
  timestamps: false
});

// Quan hệ 1-1 với User
User.hasOne(Tutor, { foreignKey: "UserID" });
Tutor.belongsTo(User, { foreignKey: "UserID" });

// Note: The association with Resource is defined here,
// but the actual Resource model is imported and the association is established
// in the index.js file to avoid circular dependencies

module.exports = Tutor;
