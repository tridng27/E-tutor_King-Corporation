const Admin = require("../models/adminModel");

const getAdminByEmail = async (email) => {
  return await Admin.findOne({ where: { email } });
};

module.exports = { getAdminByEmail };
