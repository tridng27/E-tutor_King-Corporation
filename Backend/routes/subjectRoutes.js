const express = require("express");
const { 
  getAllSubjects,
  getSubjectById,
  createSubject,
  updateSubject,
  deleteSubject
} = require("../controllers/subjectController");
const { authenticateUser, isAdmin } = require("../Middleware/roleMiddleware");

const router = express.Router();

// Public route - anyone can view subjects
router.get("/", getAllSubjects);
router.get("/:id", getSubjectById);

// Admin-only routes
router.post("/", authenticateUser, isAdmin, createSubject);
router.put("/:id", authenticateUser, isAdmin, updateSubject);
router.delete("/:id", authenticateUser, isAdmin, deleteSubject);

module.exports = router;
