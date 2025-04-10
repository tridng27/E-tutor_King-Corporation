const sequelize = require("./config/Database");
const User = require("./models/user");
const Admin = require("./models/admin");
const Tutor = require("./models/tutor");
const Student = require("./models/student");
const Subject = require("./models/subject");
const StudentSubject = require("./models/studentsubject");
const Class = require("./models/class");
const bcrypt = require("bcrypt");

const seed = async () => {
  try {
    // Check if data already exists to avoid duplicates in production
    const adminExists = await User.findOne({ 
      where: { Email: "admin@example.com" } 
    });
    
    if (adminExists) {
      console.log("✅ Seed data already exists, skipping...");
      process.exit(0);
      return;
    }

    // Sync database - Use alter:true in production to preserve existing data
    console.log("🔄 Syncing database...");
    // In development, you can use force:true, but in production use alter:true
    const syncOptions = process.env.NODE_ENV === 'production' 
      ? { alter: true } 
      : { force: true };
    await sequelize.sync(syncOptions);
    console.log("✅ Database synced!");

    // Create users with different roles
    console.log("🔄 Creating users...");
    
    // Admin user
    const adminPassword = await bcrypt.hash("admin123", 10);
    const adminUser = await User.create({
      Email: "admin@example.com",
      Password: adminPassword,
      Name: "Admin User",
      Role: "Admin",
      Birthdate: new Date("2001-08-20"),
      Gender: "Male",
      RegisterDate: new Date(),
      RequestedRole: null, // Set RequestedRole to null for admin users
      createdAt: new Date(),
      updatedAt: new Date()
    });
    await Admin.create({ 
      UserID: adminUser.UserID, 
      Supervision: "All" 
    });
    console.log("✅ Admin user created!");

    // Tutor users
    const tutors = [
      {
        Email: "tutor1@example.com",
        Password: "tutor123",
        Name: "John Smith",
        Birthdate: new Date("1985-05-15"),
        Gender: "Male",
        Specialization: "CompTIA Security+"
      },
      {
        Email: "tutor2@example.com",
        Password: "tutor123",
        Name: "Emily Johnson",
        Birthdate: new Date("1990-03-22"),
        Gender: "Female",
        Specialization: "CompTIA A+"
      },
      {
        Email: "tutor3@example.com",
        Password: "tutor123",
        Name: "Michael Chen",
        Birthdate: new Date("1988-11-10"),
        Gender: "Male",
        Specialization: "Unity Development"
      }
    ];

    for (const tutorData of tutors) {
      const tutorPassword = await bcrypt.hash(tutorData.Password, 10);
      const tutorUser = await User.create({
        Email: tutorData.Email,
        Password: tutorPassword,
        Name: tutorData.Name,
        Role: "Tutor",
        Birthdate: tutorData.Birthdate,
        Gender: tutorData.Gender,
        RegisterDate: new Date(),
        RequestedRole: "Tutor", // Set RequestedRole to match Role for tutors
        createdAt: new Date(),
        updatedAt: new Date()
      });
      
      await Tutor.create({ 
        UserID: tutorUser.UserID, 
        Fix: tutorData.Specialization 
      });
      console.log(`✅ Tutor ${tutorData.Name} created!`);
    }

    // Student users
    const students = [
      {
        Email: "student1@example.com",
        Password: "student123",
        Name: "Alex Johnson",
        Birthdate: new Date("2005-07-12"),
        Gender: "Male"
      },
      {
        Email: "student2@example.com",
        Password: "student123",
        Name: "Sophia Lee",
        Birthdate: new Date("2004-09-28"),
        Gender: "Female"
      },
      {
        Email: "student3@example.com",
        Password: "student123",
        Name: "Daniel Brown",
        Birthdate: new Date("2006-02-15"),
        Gender: "Male"
      },
      {
        Email: "student4@example.com",
        Password: "student123",
        Name: "Olivia Martinez",
        Birthdate: new Date("2005-11-30"),
        Gender: "Female"
      }
    ];

    const studentRecords = [];
    for (const studentData of students) {
      const studentPassword = await bcrypt.hash(studentData.Password, 10);
      const studentUser = await User.create({
        Email: studentData.Email,
        Password: studentPassword,
        Name: studentData.Name,
        Role: "Student",
        Birthdate: studentData.Birthdate,
        Gender: studentData.Gender,
        RegisterDate: new Date(),
        RequestedRole: "Student", // Set RequestedRole to match Role for students
        createdAt: new Date(),
        updatedAt: new Date()
      });
      
      const student = await Student.create({ 
        UserID: studentUser.UserID, 
        Role: "Student" 
      });
      
      studentRecords.push(student);
      console.log(`✅ Student ${studentData.Name} created!`);
    }

    // Create subjects
    console.log("🔄 Creating subjects...");
    const subjects = [
      { SubjectName: "CompTIA Security+", Teacher: "John Smith" },
      { SubjectName: "CompTIA A+", Teacher: "Emily Johnson" },
      { SubjectName: "Unity Development", Teacher: "Michael Chen" }
    ];

    const subjectRecords = [];
    for (const subjectData of subjects) {
      const [subject] = await Subject.findOrCreate({ 
        where: { SubjectName: subjectData.SubjectName }, 
        defaults: subjectData 
      });
      subjectRecords.push(subject);
      console.log(`✅ Subject ${subject.SubjectName} added!`);
    }

    // Assign subjects to students with random scores and attendance
    console.log("🔄 Assigning subjects to students...");
    for (const student of studentRecords) {
      for (const subject of subjectRecords) {
        await StudentSubject.create({
          StudentID: student.StudentID,
          SubjectID: subject.SubjectID,
          Score: Math.floor(Math.random() * 41) + 60, // Random score between 60-100
          Attendance: Math.floor(Math.random() * 31) + 70 // Random attendance between 70-100
        });
      }
      console.log(`✅ Subjects assigned to StudentID: ${student.StudentID}`);
    }

    // Create classes
    console.log("🔄 Creating classes...");
    const classes = [
      { 
        Name: "CompTIA Security+", 
        Description: "Comprehensive cybersecurity training covering network security, threats, vulnerabilities, and security protocols", 
        Schedule: "Monday, Wednesday 10:00-12:00" 
      },
      { 
        Name: "CompTIA A+", 
        Description: "IT fundamentals including hardware, software troubleshooting, operating systems, and basic networking", 
        Schedule: "Tuesday, Thursday 13:00-15:00" 
      },
      { 
        Name: "Unity Development", 
        Description: "Game development using Unity engine, covering C# programming, 3D modeling, and game design principles", 
        Schedule: "Monday, Friday 14:00-16:00" 
      }
    ];
   
    for (const classData of classes) {
      const [classInstance, created] = await Class.findOrCreate({
        where: { Name: classData.Name },
        defaults: classData,
      });
      
      if (created) {
        console.log(`✅ Class ${classInstance.Name} added!`);
      } else {
        console.log(`⚠️ Class ${classInstance.Name} already exists.`);
      }
    }

    // Create pending users (users without assigned roles)
    console.log("🔄 Creating pending users...");
    const pendingUsers = [
      {
        Email: "pending1@example.com",
        Password: "pending123",
        Name: "James Wilson",
        Birthdate: new Date("1995-04-18"),
        Gender: "Male"
      },
      {
        Email: "pending2@example.com",
        Password: "pending123",
        Name: "Emma Garcia",
        Birthdate: new Date("1992-08-27"),
        Gender: "Female"
      }
    ];

    for (const userData of pendingUsers) {
      const userPassword = await bcrypt.hash(userData.Password, 10);
      await User.create({
        Email: userData.Email,
        Password: userPassword,
        Name: userData.Name,
        Role: null, // Null role for pending users
        Birthdate: userData.Birthdate,
        Gender: userData.Gender,
        RegisterDate: new Date(),
        RequestedRole: "Student", // Default RequestedRole for pending users
        createdAt: new Date(),
        updatedAt: new Date()
      });
      console.log(`✅ Pending user ${userData.Name} created!`);
    }

    console.log("✅ Seed data created successfully.");
    process.exit(0);
  } catch (error) {
    console.error("❌ Error seeding data:", error);
    console.error(error.stack);
    process.exit(1);
  }
};

// Check if this script is being run directly (not imported)
if (require.main === module) {
  seed();
}

module.exports = seed; // Export for potential programmatic use
