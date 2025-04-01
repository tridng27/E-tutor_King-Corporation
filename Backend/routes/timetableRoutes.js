const express = require("express");
const router = express.Router();
const timetableController = require("../controllers/timetableController");
const { authenticateUser, isAdmin } = require("../Middleware/roleMiddleware");

// Apply authentication to all routes
router.use(authenticateUser);

// Routes accessible to all authenticated users
router.get("/", timetableController.getTimetables);
router.get("/:id", timetableController.getTimetableById);

// Routes that require admin privileges
router.post("/", isAdmin, timetableController.createTimetable);
router.put("/:id", isAdmin, timetableController.updateTimetable);
router.delete("/:id", isAdmin, timetableController.deleteTimetable);

// Additional routes for specific queries
router.get("/class/:classId", timetableController.getTimetablesByClass);
router.get("/tutor/:tutorId", timetableController.getTimetablesByTutor);

module.exports = router;
