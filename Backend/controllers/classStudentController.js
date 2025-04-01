const { ClassStudent, Class, Student, User } = require("../models");
const { Op } = require("sequelize");
const { sendClassAssignmentNotification } = require('../services/emailService');

// Update your assignStudentToClass function
assignStudentToClass = async (req, res) => {
    try {
        const { ClassID } = req.params;  // Changed from classId to ClassID to match route
        const { StudentID } = req.body;  // Changed from studentId to StudentID to match frontend
        
        // Check if class exists
        const classObj = await Class.findByPk(ClassID);
        if (!classObj) {
            return res.status(404).json({ message: "Class not found" });
        }
        
        // Check if student exists
        const student = await Student.findByPk(StudentID, {
            include: [{ model: User }]  // Include User model to get email
        });
        
        if (!student) {
            return res.status(404).json({ message: "Student not found" });
        }
        
        // Check if student is already in class
        const existingAssignment = await ClassStudent.findOne({
            where: { ClassID, StudentID }
        });
        
        if (existingAssignment) {
            return res.status(400).json({ message: "Student is already assigned to this class" });
        }
        
        // Create the assignment
        await ClassStudent.create({
            ClassID,
            StudentID
        });
        
        // Send email notification if student has a user with email
        if (student.User && student.User.Email) {
            try {
                await sendClassAssignmentNotification(
                    student.User, 
                    classObj.Name.trim(), // Trim whitespace from class name
                    'Student'
                );
                console.log(`Email notification sent to student ${student.User.Email}`);
            } catch (emailError) {
                console.error("Error sending email notification:", emailError);
                // Continue with the response even if email fails
            }
        }
        // Send email notification if student has a user with email
        res.status(201).json({ 
            message: "Student assigned to class successfully. Email notification sent." 
        });
    } catch (error) {
        console.error("Error assigning student to class:", error);
        res.status(500).json({ 
            message: "Error assigning student to class", 
            error: error.message 
        });
    }
};

// Xóa học sinh khỏi lớp
const removeStudentFromClass = async (req, res) => {
    try {
        const { ClassID, StudentID } = req.params;

        const record = await ClassStudent.findOne({ where: { ClassID, StudentID } });
        if (!record) {
            return res.status(404).json({ message: "Student is not in this class" });
        }

        await record.destroy();
        res.json({ message: "Student removed from class successfully" });
    } catch (error) {
        res.status(500).json({ message: "Error removing student from class", error });
    }
};

// Lấy danh sách học sinh theo lớp
const getStudentsByClass = async (req, res) => {
    try {
        const { ClassID } = req.params;

        const classWithStudents = await Class.findByPk(ClassID, {
            include: [{
                model: Student,
                include: [{
                    model: User,
                    attributes: ['Name', 'Email', 'Birthdate', 'Gender']
                }]
            }]
        });

        if (!classWithStudents) {
            return res.status(404).json({ message: "Class not found" });
        }

        res.json(classWithStudents.Students);
    } catch (error) {
        console.error("Error fetching students:", error);
        res.status(500).json({ message: "Error fetching students", error });
    }
};

// Lấy danh sách học sinh KHÔNG thuộc lớp
const getStudentsNotInClass = async (req, res) => {
    try {
        const { ClassID } = req.params;

        // 1. Lấy tất cả học sinh đã có trong lớp
        const studentsInClass = await ClassStudent.findAll({
            where: { ClassID },
            attributes: ['StudentID']
        });

        const studentIdsInClass = studentsInClass.map(s => s.StudentID);

        // 2. Lấy danh sách học sinh KHÔNG có trong lớp
        const studentsNotInClass = await Student.findAll({
            where: {
                StudentID: {
                    [Op.notIn]: studentIdsInClass
                }
            },
            include: [{
                model: User,
                attributes: ['Name', 'Email', 'Birthdate', 'Gender']
            }]
        });

        res.json(studentsNotInClass);
    } catch (error) {
        console.error("Error fetching students not in class:", error);
        res.status(500).json({ message: "Error fetching students", error });
    }
};

module.exports = { assignStudentToClass, removeStudentFromClass, getStudentsByClass, getStudentsNotInClass };
