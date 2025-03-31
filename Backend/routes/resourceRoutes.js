const express = require("express");
const router = express.Router();
const resourceController = require("../controllers/resourceController");
const { authenticateUser, isAdminOrTutor } = require("../middleware/roleMiddleware");

// Public routes (still require authentication)
router.get("/", authenticateUser, resourceController.getAllResources);
router.get("/:id", authenticateUser, resourceController.getResourceById);
router.get("/:id/download", authenticateUser, resourceController.downloadResource);

// Protected routes - only for tutors and admins
router.post("/", authenticateUser, isAdminOrTutor, resourceController.createResource);
router.put("/:id", authenticateUser, isAdminOrTutor, resourceController.updateResource);
router.delete("/:id", authenticateUser, isAdminOrTutor, resourceController.deleteResource);

module.exports = router;
