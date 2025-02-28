const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const authRoutes = require("./routes/authRoutes");
const { authenticateToken } = require("./Middleware/authMiddleware");

require("dotenv").config();

const app = express();
app.use(cors());
app.use(bodyParser.json());

// Routes
app.use("/api/auth", authRoutes);

// Test route yêu cầu xác thực
app.get("/api/protected", authenticateToken, (req, res) => {
    res.json({ message: "You have accessed a protected route", user: req.user });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
