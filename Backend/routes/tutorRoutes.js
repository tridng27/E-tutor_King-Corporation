const express = require("express");
const { tutorLogin } = require("../controllers/tutorController");

const router = express.Router();

router.post("/login", tutorLogin);

module.exports = router;
