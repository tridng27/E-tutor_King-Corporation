const express = require("express");
const router = express.Router();
const {getAllClasses, getClassById, createClass, updateClass, deleteClass,} = require("../controllers/classController");
const { authenticateUser, isAdmin } = require("../Middleware/roleMiddleware");

// 📌 Middleware xác thực người dùng (áp dụng cho tất cả route)
router.use(authenticateUser);


// 📌 API dành cho Admin quản lý lớp học
router.get("/", getAllClasses);
router.get("/:id", getClassById);


router.post("/", isAdmin, createClass);
router.put("/:id", isAdmin, updateClass);
router.delete("/:id", isAdmin, deleteClass);

module.exports = router;
