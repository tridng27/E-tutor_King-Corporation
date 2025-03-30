const express = require("express");
const { 
    getAllUsers, 
    deleteUser, 
    getPendingUsers, 
    assignUserRole
} = require("../controllers/adminController");
const { authenticateUser, isAdmin } = require("../Middleware/roleMiddleware");

const router = express.Router();

// All routes require authentication and admin role
router.use(authenticateUser, isAdmin);

// User management routes
router.get("/users", getAllUsers);
router.get("/users/pending", getPendingUsers);
router.post("/users/assign-role", assignUserRole);
router.delete("/delete/:id", deleteUser);

module.exports = router;
