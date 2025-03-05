// seedData.js
const sequelize = require('./config/Database'); // Lấy instance của Sequelize
const User = require('./models/user');
const Admin = require('./models/admin');
const Tutor = require('./models/tutor');
const Student = require('./models/student');
const bcrypt = require('bcrypt');

const seed = async () => {
  try {
    // Đồng bộ database, xoá tất cả dữ liệu cũ và tạo lại bảng
    await sequelize.sync({ force: true });
    console.log("Database synced!");

    // Tạo tài khoản Admin
    const adminPassword = await bcrypt.hash("admin123", 10);
    const adminUser = await User.create({
      Email: "admin@example.com",
      Password: adminPassword,
      Name: "Admin User",
      Role: "Admin"
    });
    // Tạo record Admin liên kết với tài khoản Admin
    await Admin.create({
      UserID: adminUser.UserID,
      Supervision: "All"
    });

    // Tạo tài khoản Tutor
    const tutorPassword = await bcrypt.hash("tutor123", 10);
    const tutorUser = await User.create({
      Email: "tutor@example.com",
      Password: tutorPassword,
      Name: "Tutor User",
      Role: "Tutor"
    });
    // Tạo record Tutor liên kết với tài khoản Tutor
    await Tutor.create({
      UserID: tutorUser.UserID,
      Fix: "Math"
    });

    // Tạo tài khoản Student
    const studentPassword = await bcrypt.hash("student123", 10);
    const studentUser = await User.create({
      Email: "student@example.com",
      Password: studentPassword,
      Name: "Student User",
      Role: "Student"
    });
    // Tạo record Student liên kết với tài khoản Student
    await Student.create({
      UserID: studentUser.UserID,
      Role: "Student"
    });

    console.log("Seed data created successfully.");
    process.exit();
  } catch (error) {
    console.error("Error seeding data:", error);
    process.exit(1);
  }
};

seed();
