// services/adminService.js
const { User } = require('../models');

/**
 * Lấy danh sách các user chưa được duyệt (Role null hoặc Pending)
 */
const getPendingUsers = async () => {
  return await User.findAll({
    where: { Role: Pending }, // hoặc nếu bạn dùng chuỗi 'Pending' thay cho null\n    attributes: ['UserID', 'Email', 'Name', 'RegisterDate']
  });
};

/**
 * Phân quyền cho user.
 * newRole phải là một trong các giá trị: 'Admin', 'Tutor', 'Student'
 * Chỉ admin mới có quyền gọi hàm này (đã được xác thực ở middleware hoặc controller riêng)
 */
const approveUserRole = async (userId, newRole, adminId) => {
  // Giả sử adminId đã được xác thực là admin ở controller/middleware
  const admin = await User.findByPk(adminId);
  if (!admin || admin.Role !== 'Admin') {
    throw new Error('Bạn không có quyền thực hiện hành động này.');
  }
  
  const user = await User.findByPk(userId);
  if (!user) {
    throw new Error('Người dùng không tồn tại.');
  }
  
  user.Role = newRole;
  await user.save();
  return user;
};

module.exports = { getPendingUsers, approveUserRole };
