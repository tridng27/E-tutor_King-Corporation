const express = require("express");
const { getAllUsers, createAdmin, updateUser, deleteUser } = require("../controllers/adminController");
const { authenticateUser, isAdmin } = require("../Middleware/roleMiddleware");

const router = express.Router();

router.use(authenticateUser, isAdmin);

router.get("/users", getAllUsers);
router.post("/create-admin", createAdmin);
router.put("/update/:id", updateUser);
router.delete("/delete/:id", deleteUser);

module.exports = router;
