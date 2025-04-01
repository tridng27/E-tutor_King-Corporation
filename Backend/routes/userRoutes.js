const express = require("express");
const router = express.Router();
const userController = require("../controllers/userController");
const { authenticateUser } = require("../Middleware/roleMiddleware");

// Search users for direct messaging (must be before /:id route)
router.get("/search", authenticateUser, userController.searchUsers);

router.get("/test-search", authenticateUser, userController.testUserSearch);

// Get all users (admin only)
router.get("/", authenticateUser, userController.getAllUsers);

// Get user by ID (admin or self)
router.get("/:id", authenticateUser, userController.getUserById);

// Update user (admin or self)
router.put("/:id", authenticateUser, userController.updateUser);

// Delete user (admin only)
router.delete("/:id", authenticateUser, userController.deleteUser);

module.exports = router;
