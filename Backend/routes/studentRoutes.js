const express = require("express");
const { getStudentProfile, updateStudentProfile } = require("../controllers/studentController");
const { authenticateUser, isStudent } = require("../middlewares/roleMiddleware");

const router = express.Router();

router.use(authenticateUser, isStudent);

router.get("/profile", getStudentProfile);
router.put("/update", updateStudentProfile);

module.exports = router;
