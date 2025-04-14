const { DataTypes } = require("sequelize");
const sequelize = require("../config/Database");
const User = require("./user");

const Post = sequelize.define("Post", {
  PostID: {
    type: DataTypes.BIGINT,
    primaryKey: true,
    autoIncrement: true
  },
  UserID: {
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
  Hashtags: {
    type: DataTypes.ARRAY(DataTypes.STRING),
    defaultValue: []
  },
  ImageURL: {
    type: DataTypes.STRING,
    allowNull: true
  },
  Likes: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  LikedBy: {
    type: DataTypes.ARRAY(DataTypes.BIGINT),
    defaultValue: []
  },
  Shares: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  CreatedAt: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  },
  UpdatedAt: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  }
}, {
  tableName: "Posts", 
  timestamps: true,
  createdAt: 'CreatedAt',
  updatedAt: 'UpdatedAt'
});

// Relationship with User
User.hasMany(Post, { foreignKey: "UserID" });
Post.belongsTo(User, { foreignKey: "UserID" });

module.exports = Post;
