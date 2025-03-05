// server.js
const express = require("express");
require("dotenv").config();
const authRoutes = require("./routes/authRoutes");

// Tạo instance của Express
const app = express();
const PORT = process.env.PORT || 5000;

// Middleware để parse JSON request body
app.use(express.json());
app.use("/api/auth", authRoutes);

// Ví dụ định nghĩa route cơ bản
app.get("/", (req, res) => {
  res.send("Hello World! Server is running.");
});

// Khởi chạy server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
