const { DataTypes } = require("sequelize");
const sequelize = require("../config/Database");
const User = require("./user");

// Define the Comment model first without relationships
const Comment = sequelize.define("Comment", {
  CommentID: {
    type: DataTypes.BIGINT,
    primaryKey: true,
    autoIncrement: true
  },
  DiscID: {
    type: DataTypes.BIGINT,
    allowNull: true
  },
  PostID: {
    type: DataTypes.BIGINT,
    allowNull: true
  },
  UserID: {  // Changed from Author to UserID for consistency
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
  CreatedDate: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  }
}, {
  tableName: "Comment",
  timestamps: false
  // Removed the validation block entirely
});

// User relationship
User.hasMany(Comment, { foreignKey: "UserID" });
Comment.belongsTo(User, { foreignKey: "UserID" });

// Export the model
module.exports = Comment;

// Import Discussion and Post models after exporting Comment to avoid circular dependencies
const Discussion = require("./discussion");
const Post = require("./post");

// Set up foreign key references after import
Comment.belongsTo(Discussion, { 
  foreignKey: "DiscID",
  constraints: false  // Disable constraint to allow null values
});
Discussion.hasMany(Comment, { 
  foreignKey: "DiscID",
  constraints: false
});

Comment.belongsTo(Post, { 
  foreignKey: "PostID",
  constraints: false
});
Post.hasMany(Comment, { 
  foreignKey: "PostID",
  constraints: false
});
