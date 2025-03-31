// models/index.js
const sequelize = require('../config/Database');

// Import tất cả model
const User = require('./user');
const Admin = require('./admin');
const Class = require('./class');
const Comment = require('./comment');
const Discussion = require('./discussion');
const Homework = require('./homework');
const LiveChat = require('./livechat');
const Meeting = require('./meeting');
const Post = require('./post');
const Resource = require('./resource');
const Student = require('./student');
const Subject = require('./subject');
const Ticket = require('./ticket');
const Tutor = require('./tutor');
const ClassStudent = require('./classstudent');

// Export
module.exports = {
  sequelize,
  User,
  Admin,
  Class,
  Comment,
  Discussion,
  Homework,
  LiveChat,
  Meeting,
  Post,
  Resource,
  Student,
  Subject,
  Ticket,
  Tutor,
  ClassStudent
};
