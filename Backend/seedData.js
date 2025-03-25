const sequelize = require("./config/Database");
const User = require("./models/user");
const Admin = require("./models/admin");
const Tutor = require("./models/tutor");
const Student = require("./models/student");
const Subject = require("./models/subject");
const StudentSubject = require("./models/studentsubject");
const bcrypt = require("bcrypt");

const seed = async () => {
  try {
    await sequelize.sync({ alter: true }); // Giữ dữ liệu cũ, chỉ cập nhật nếu cần
    console.log("✅ Database synced!");

    // 👉 Kiểm tra và tạo Admin nếu chưa có
    const adminExists = await User.findOne({ where: { Email: "admin@example.com" } });
    if (!adminExists) {
      const adminPassword = await bcrypt.hash("admin123", 10);
      const adminUser = await User.create({
        Email: "admin@example.com",
        Password: adminPassword,
        Name: "Admin User",
        Role: "Admin",
      });
      await Admin.create({ UserID: adminUser.UserID, Supervision: "All" });
      console.log("✅ Admin user created!");
    }

    // 👉 Kiểm tra và tạo Tutor nếu chưa có
    const tutorExists = await User.findOne({ where: { Email: "tutor@example.com" } });
    if (!tutorExists) {
      const tutorPassword = await bcrypt.hash("tutor123", 10);
      const tutorUser = await User.create({
        Email: "tutor@example.com",
        Password: tutorPassword,
        Name: "Tutor User",
        Role: "Tutor",
      });
      await Tutor.create({ UserID: tutorUser.UserID, Fix: "Math" });
      console.log("✅ Tutor user created!");
    }

    // 👉 Kiểm tra và tạo Student nếu chưa có
    const studentExists = await User.findOne({ where: { Email: "student@example.com" } });
    let studentUser;
    if (!studentExists) {
      const studentPassword = await bcrypt.hash("student123", 10);
      studentUser = await User.create({
        Email: "student@example.com",
        Password: studentPassword,
        Name: "Student User",
        Role: "Student",
      });
      await Student.create({ UserID: studentUser.UserID });
      console.log("✅ Student user created!");
    } else {
      studentUser = studentExists;
    }

    // 👉 Kiểm tra và tạo các môn học nếu chưa có
    const subjects = [
      { SubjectName: "Toán", Teacher: "Thầy Nam" },
      { SubjectName: "Văn", Teacher: "Cô Hương" },
    ];
    for (const subj of subjects) {
      const [subject] = await Subject.findOrCreate({ where: { SubjectName: subj.SubjectName }, defaults: subj });
      console.log(`✅ Subject ${subject.SubjectName} added!`);
    }

    // 👉 Kiểm tra và gán điểm số, điểm danh cho học sinh
    const studentRecord = await Student.findOne({ where: { UserID: studentUser.UserID } });
    if (studentRecord) {
      const subjectList = await Subject.findAll();
      for (const subject of subjectList) {
        await StudentSubject.findOrCreate({
          where: { StudentID: studentRecord.StudentID, SubjectID: subject.SubjectID },
          defaults: { Score: Math.floor(Math.random() * 100), Attendance: Math.floor(Math.random() * 100) },
        });
        console.log(`✅ Score and attendance added for ${subject.SubjectName}`);
      }
    }

    console.log("✅ Seed data created successfully.");
    process.exit();
  } catch (error) {
    console.error("❌ Error seeding data:", error);
    process.exit(1);
  }
};

seed();
