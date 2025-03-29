const express = require("express");
const { 
  getTutorProfile, 
  updateTutorProfile, 
  getMyStudents,
  getTutorResources,
  createResource,
  updateResource,
  deleteResource
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
router.put("/update", updateTutorProfile);
router.get("/students", getMyStudents);

// Resource routes
router.get("/resources", getTutorResources);
router.post("/resources", createResource);
router.put("/resources/:id", canModifyResource, updateResource);
router.delete("/resources/:id", canModifyResource, deleteResource);

// Get tutor by ID for resource details
router.get("/me", (req, res) => {
  res.json({ 
    TutorID: req.user.TutorID,
    UserID: req.user.dataValues.UserID,
    Name: req.user.dataValues.Name
  });
});

module.exports = router;
