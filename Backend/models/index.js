// models/index.js
const sequelize = require('../config/Database');

// Import tất cả model
const User = require('./user');
const Admin = require('./admin');
const Class = require('./class');
const Comment = require('./comment');
const Discussion = require('./discussion');
const DirectMessage = require('./directmessage'); // Added DirectMessage
const Homework = require('./homework');
const LiveChat = require('./livechat');
const Meeting = require('./meeting');
const Post = require('./post');
const Resource = require('./resource');
const Student = require('./student');
const Subject = require('./subject');
const Ticket = require('./ticket');
const Tutor = require('./tutor');
const Timetable = require('./timetable');
const ClassStudent = require('./classstudent'); 

// Define associations between models
// DirectMessage associations
User.hasMany(DirectMessage, { foreignKey: 'SenderID', as: 'SentMessages' });
User.hasMany(DirectMessage, { foreignKey: 'ReceiverID', as: 'ReceivedMessages' });
DirectMessage.belongsTo(User, { foreignKey: 'SenderID', as: 'Sender' });
DirectMessage.belongsTo(User, { foreignKey: 'ReceiverID', as: 'Receiver' });

// Export
module.exports = {
  sequelize,
  User,
  Admin,
  Class,
  Comment,
  Discussion,
  DirectMessage,
  Homework,
  LiveChat,
  Meeting,
  Post,
  Resource,
  Student,
  Subject,
  Ticket,
  Tutor,
  Timetable,
  ClassStudent
};
