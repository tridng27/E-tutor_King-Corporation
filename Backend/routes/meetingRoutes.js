const express = require("express");
const { v4: uuidv4 } = require("uuid");

const router = express.Router();

router.get("/create-room", (req, res) => {
    const roomId = uuidv4();
    res.json({ roomId });
});

module.exports = router;
