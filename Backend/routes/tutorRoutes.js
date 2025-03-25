const express = require("express");
const { getTutorProfile, updateTutorProfile, getMyStudents } = require("../controllers/tutorController");
const { authenticateUser, isTutor } = require("../middleware/roleMiddleware");

const router = express.Router();

router.use(authenticateUser, isTutor);

router.get("/profile", getTutorProfile);
router.put("/update", updateTutorProfile);
router.get("/students", getMyStudents);

module.exports = router;
