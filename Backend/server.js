const express = require("express");
require("dotenv").config();
const cors = require("cors");
const authRoutes = require("./routes/authRoutes");
const studentRoutes = require("./routes/studentRoutes");
const sequelize = require("./config/Database"); // Import database

// Tạo instance của Express
const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/students", studentRoutes);

app.get("/", (req, res) => {
  res.send("Hello World! Server is running.");
});

// Xử lý lỗi tập trung
app.use((err, req, res, next) => {
  console.error("Lỗi hệ thống:", err);
  res.status(500).json({ error: "Đã có lỗi xảy ra, vui lòng thử lại!" });
});

// Kết nối database trước khi chạy server
sequelize
  .authenticate()
  .then(() => {
    console.log("Database connected!");
    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
    });
  })
  .catch((error) => {
    console.error("Lỗi kết nối database:", error);
  });
