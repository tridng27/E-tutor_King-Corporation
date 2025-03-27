// services/userService.js
const { User } = require('../models');

/**
 * Lấy danh sách tất cả user.
 */
const getAllUsers = async () => {
  return await User.findAll({
    attributes: ['UserID', 'Email', 'Name', 'Role', 'RegisterDate']
  });
};

/**
 * Lấy thông tin user theo ID.
 */
const getUserById = async (id) => {
  return await User.findByPk(id, {
    attributes: ['UserID', 'Email', 'Name', 'Role', 'RegisterDate']
  });
};

module.exports = { getAllUsers, getUserById };
