const express = require("express");
const {
  getTutorProfile,
  updateTutor,  // Changed from updateTutorProfile to updateTutor
  getMyStudents,
  getTutorResources,
  createResource,
  updateResource,
  deleteResource,
  getTutorClasses,
  getStudentsByClass,
  getResourceById,
  downloadResource
} = require("../controllers/tutorController");

const {
  authenticateUser,
  isTutor,
  canModifyResource
} = require("../Middleware/roleMiddleware");  // Fixed typo in path

const router = express.Router();

// Apply authentication and tutor role check to all routes
router.use(authenticateUser, isTutor);

// Profile routes
router.get("/profile", getTutorProfile);
router.put("/update", updateTutor);  // Changed from updateTutorProfile to updateTutor
router.get("/students", getMyStudents);

// Class management routes
router.get("/classes", getTutorClasses);
router.get("/classes/:classId/students", getStudentsByClass);

// Resource routes
router.get("/resources", getTutorResources);
router.post("/resources", createResource);
router.get("/resources/:id", getResourceById);
router.put("/resources/:id", canModifyResource, updateResource);
router.delete("/resources/:id", canModifyResource, deleteResource);
router.get("/resources/:id/download", downloadResource);

// Get tutor by ID for resource details
router.get("/me", (req, res) => {
  res.json({
    TutorID: req.user.TutorID,
    UserID: req.user.dataValues.UserID,
    Name: req.user.dataValues.Name
  });
});

module.exports = router;
