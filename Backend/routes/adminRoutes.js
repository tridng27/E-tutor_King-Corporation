const express = require("express");
const adminController = require("../controllers/adminController");
const { authenticateUser, isAdmin } = require("../Middleware/roleMiddleware");

const router = express.Router();

// Apply authentication and admin role check to all routes
router.use(authenticateUser, isAdmin);

// User management routes
router.get("/users", adminController.getAllUsers);
router.get("/users/pending", adminController.getPendingUsers);
router.post("/users/assign-role", adminController.assignUserRole);
router.delete("/users/:id", adminController.deleteUser);

// Tutor management routes
router.get("/tutors", adminController.getAllTutors);
router.get("/tutors/:id", adminController.getTutorById);
router.put("/tutors/:id", adminController.updateTutor);
router.delete("/tutors/:id", adminController.deleteTutor);

// Class-tutor assignment routes
router.get("/classes/without-tutor", adminController.getClassesWithoutTutor);
router.get("/tutors/:tutorId/classes", adminController.getClassesByTutor);
router.post("/classes/:classId/tutors/:tutorId", adminController.assignTutorToClass);
router.delete("/classes/:classId/tutors/:tutorId", adminController.removeTutorFromClass);

module.exports = router;
