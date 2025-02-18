const AdminModel = require('../models/adminModel');

class AdminService {
  static async getAllAdmins() {
    return await AdminModel.getAllAdmins();
  }

  static async getAdminById(id) {
    return await AdminModel.getAdminById(id);
  }

  static async createAdmin(admin) {
    return await AdminModel.createAdmin(admin);
  }
}

module.exports = AdminService;
