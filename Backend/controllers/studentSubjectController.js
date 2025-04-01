// Import all models through the index.js file
const db = require("../models");

// Get all subjects for a specific student
exports.getStudentSubjects = async (req, res) => {
    try {
        const { studentId } = req.params;
        
        // Validate studentId
        if (!studentId) {
            return res.status(400).json({ message: "Student ID is required" });
        }
        
        // Find all subject records for this student
        const studentSubjects = await db.StudentSubject.findAll({
            where: { StudentID: studentId },
            include: [
                {
                    model: db.Subject,
                    // Only include fields that exist in your Subject table
                    attributes: ['SubjectID', 'SubjectName']
                }
            ]
        });
        
        res.status(200).json(studentSubjects);
    } catch (error) {
        console.error("Error fetching student subjects:", error);
        res.status(500).json({ 
            message: "Error fetching student subjects", 
            error: error.message 
        });
    }
};

// Update a student's subject record (score and attendance)
exports.updateStudentSubject = async (req, res) => {
    try {
        const { id } = req.params;
        const { Score, Attendance } = req.body;
        
        // Find the student subject record
        const studentSubject = await db.StudentSubject.findByPk(id);
        
        if (!studentSubject) {
            return res.status(404).json({ message: "Student subject record not found" });
        }
        
        // Update the record
        await studentSubject.update({
            Score: Score !== undefined ? Score : studentSubject.Score,
            Attendance: Attendance !== undefined ? Attendance : studentSubject.Attendance
        });
        
        res.status(200).json({ 
            message: "Student subject record updated successfully",
            studentSubject
        });
    } catch (error) {
        console.error("Error updating student subject:", error);
        res.status(500).json({ 
            message: "Error updating student subject", 
            error: error.message 
        });
    }
};

// Get all student subjects
exports.getAllStudentSubjects = async (req, res) => {
    try {
        const studentSubjects = await db.StudentSubject.findAll({
            include: [
                {
                    model: db.Subject,
                    attributes: ['SubjectID', 'SubjectName']
                },
                {
                    model: db.Student,
                    include: [
                        {
                            model: db.User,
                            attributes: ['Name', 'Email']
                        }
                    ]
                }
            ]
        });
        
        res.status(200).json(studentSubjects);
    } catch (error) {
        console.error("Error fetching all student subjects:", error);
        res.status(500).json({ 
            message: "Error fetching all student subjects", 
            error: error.message 
        });
    }
};

// Create a new student subject record
exports.createStudentSubject = async (req, res) => {
    try {
        const { StudentID, SubjectID, Score, Attendance } = req.body;
        
        // Validate required fields
        if (!StudentID || !SubjectID) {
            return res.status(400).json({ message: "StudentID and SubjectID are required" });
        }
        
        // Check if student exists
        const student = await db.Student.findByPk(StudentID);
        if (!student) {
            return res.status(404).json({ message: "Student not found" });
        }
        
        // Check if subject exists
        const subject = await db.Subject.findByPk(SubjectID);
        if (!subject) {
            return res.status(404).json({ message: "Subject not found" });
        }
        
        // Check if record already exists
        const existingRecord = await db.StudentSubject.findOne({
            where: {
                StudentID,
                SubjectID
            }
        });
        
        if (existingRecord) {
            return res.status(400).json({ message: "Student is already assigned to this subject" });
        }
        
        // Create new record
        const newStudentSubject = await db.StudentSubject.create({
            StudentID,
            SubjectID,
            Score,
            Attendance
        });
        
        res.status(201).json({
            message: "Student subject record created successfully",
            studentSubject: newStudentSubject
        });
    } catch (error) {
        console.error("Error creating student subject:", error);
        res.status(500).json({ 
            message: "Error creating student subject", 
            error: error.message 
        });
    }
};

// Delete a student subject record
exports.deleteStudentSubject = async (req, res) => {
    try {
        const { id } = req.params;
        
        // Find the record
        const studentSubject = await db.StudentSubject.findByPk(id);
        
        if (!studentSubject) {
            return res.status(404).json({ message: "Student subject record not found" });
        }
        
        // Delete the record
        await studentSubject.destroy();
        
        res.status(200).json({ message: "Student subject record deleted successfully" });
    } catch (error) {
        console.error("Error deleting student subject:", error);
        res.status(500).json({ 
            message: "Error deleting student subject", 
            error: error.message 
        });
    }
};

// Get subjects for a specific class
exports.getSubjectsByClass = async (req, res) => {
    try {
        const { classId } = req.params;
        
        // Get all students in the class
        const classStudents = await db.ClassStudent.findAll({
            where: { ClassID: classId },
            attributes: ['StudentID']
        });
        
        const studentIds = classStudents.map(cs => cs.StudentID);
        
        // Get all subjects for these students
        const studentSubjects = await db.StudentSubject.findAll({
            where: {
                StudentID: {
                    [db.Sequelize.Op.in]: studentIds
                }
            },
            include: [
                {
                    model: db.Subject,
                    attributes: ['SubjectID', 'SubjectName']
                },
                {
                    model: db.Student,
                    include: [
                        {
                            model: db.User,
                            attributes: ['Name']
                        }
                    ]
                }
            ]
        });
        
        res.status(200).json(studentSubjects);
    } catch (error) {
        console.error("Error fetching subjects by class:", error);
        res.status(500).json({ 
            message: "Error fetching subjects by class", 
            error: error.message 
        });
    }
};
