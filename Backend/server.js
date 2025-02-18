const express = require('express');
const StudentService = require('./services/studentService');
const TutorService = require('./services/tutorService');
const AdminService = require('./services/adminService');

const app = express();
app.use(express.json());

app.get('/students', async (req, res) => {
  const students = await StudentService.getAllStudents();
  res.json(students);
});

app.get('/tutors', async (req, res) => {
  const tutors = await TutorService.getAllTutors();
  res.json(tutors);
});

app.get('/admins', async (req, res) => {
  const admins = await AdminService.getAllAdmins();
  res.json(admins);
});

const PORT = 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});
