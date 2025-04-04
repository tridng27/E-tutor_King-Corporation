const express = require('express');
const router = express.Router();
const studentSubjectController = require('../controllers/studentSubjectController');
const { authenticateUser } = require('../Middleware/roleMiddleware');

// Get all student subjects
router.get('/', authenticateUser, studentSubjectController.getAllStudentSubjects);

// Create a new student subject record - THIS IS THE MISSING ROUTE
router.post('/', authenticateUser, studentSubjectController.createStudentSubject);

// Get subjects for a specific student
router.get('/students/:studentId/subjects', authenticateUser, studentSubjectController.getStudentSubjects);

// Get subjects for a specific class
router.get('/class/:classId', authenticateUser, studentSubjectController.getSubjectsByClass);

// Update a student's subject score and attendance
router.put('/:id', authenticateUser, studentSubjectController.updateStudentSubject);

// Delete a student subject record
router.delete('/:id', authenticateUser, studentSubjectController.deleteStudentSubject);

module.exports = router;
