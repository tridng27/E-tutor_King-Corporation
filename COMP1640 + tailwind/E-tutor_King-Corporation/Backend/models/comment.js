const { DataTypes } = require("sequelize");
const sequelize = require("../config/Database");
const Discussion = require("./discussion");
const User = require("./user");

const Comment = sequelize.define("Comment", {
  CommentID: {
    type: DataTypes.BIGINT,
    primaryKey: true,
    autoIncrement: true
  },
  DiscID: {
    type: DataTypes.BIGINT,
    allowNull: true,
    references: {
      model: Discussion,
      key: "DiscID"
    }
  },
  Author: {
    type: DataTypes.BIGINT,
    allowNull: true,
    references: {
      model: User,
      key: "UserID"
    }
  },
  Content: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  CreatedDate: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  }
}, {
  tableName: "Comment",
  timestamps: false
});

// Quan hệ
Discussion.hasMany(Comment, { foreignKey: "DiscID" });
Comment.belongsTo(Discussion, { foreignKey: "DiscID" });

User.hasMany(Comment, { foreignKey: "Author" });
Comment.belongsTo(User, { foreignKey: "Author" });

module.exports = Comment;
