const { DataTypes } = require("sequelize");
const sequelize = require("../config/Database");
const User = require("./user");

const DirectMessage = sequelize.define("DirectMessage", {
  MessageID: {
    type: DataTypes.BIGINT,
    primaryKey: true,
    autoIncrement: true
  },
  SenderID: {
    type: DataTypes.BIGINT,
    allowNull: false,
    references: {
      model: User,
      key: "UserID"
    }
  },
  ReceiverID: {
    type: DataTypes.BIGINT,
    allowNull: false,
    references: {
      model: User,
      key: "UserID"
    }
  },
  Content: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  IsRead: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  Timestamp: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  }
}, {
  tableName: "DirectMessage",
  timestamps: false
});

module.exports = DirectMessage;
