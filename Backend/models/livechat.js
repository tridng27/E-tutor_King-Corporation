const { DataTypes } = require("sequelize");
const sequelize = require("../config/Database");
const User = require("./user");

const LiveChat = sequelize.define("LiveChat", {
  ChatID: {
    type: DataTypes.BIGINT,
    primaryKey: true,
    autoIncrement: true
  },
  Role: {
    type: DataTypes.CHAR(20),
    allowNull: false
  },
  UserID: {
    type: DataTypes.BIGINT,
    allowNull: true,
    references: {
      model: User,
      key: "UserID"
    }
  },
  Message: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  Timestamp: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  }
}, {
  tableName: "LiveChat",
  timestamps: false
});

User.hasMany(LiveChat, { foreignKey: "UserID" });
LiveChat.belongsTo(User, { foreignKey: "UserID" });

module.exports = LiveChat;
