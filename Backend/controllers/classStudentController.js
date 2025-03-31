const { ClassStudent, Class, Student, User } = require("../models");
const { Op } = require("sequelize");

// Thêm học sinh vào lớp
const assignStudentToClass = async (req, res) => {
    try {
        const { ClassID } = req.params;  // Lấy ClassID từ URL
        const { StudentID } = req.body;  // StudentID vẫn lấy từ body

        console.log("ClassID from request params:", ClassID);
        console.log("StudentID from request body:", StudentID);

        if (!ClassID || !StudentID) {
            return res.status(400).json({ message: "Missing ClassID or StudentID" });
        }

        const student = await Student.findByPk(StudentID);
        if (!student) {
            return res.status(404).json({ message: "Student not found" });
        }

        const classExists = await Class.findByPk(ClassID);
        if (!classExists) {
            return res.status(404).json({ message: "Class not found" });
        }

        // Kiểm tra xem học sinh đã ở trong lớp chưa
        const existingRecord = await ClassStudent.findOne({ where: { ClassID, StudentID } });
        if (existingRecord) {
            return res.status(400).json({ message: "Student is already assigned to this class" });
        }

        await ClassStudent.create({ ClassID, StudentID });
        res.status(201).json({ message: "Student assigned to class successfully" });
    } catch (error) {
        console.error("Error assigning student to class:", error);
        res.status(500).json({ message: "Error assigning student to class", error });
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
