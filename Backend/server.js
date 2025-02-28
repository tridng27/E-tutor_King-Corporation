const express = require("express");
const cors = require("cors");
const axios = require("axios");

const app = express();
const port = 5001; // Chạy khác port với json-server

app.use(cors());
app.use(express.json());

// Route đăng nhập
app.post("/api/login", async (req, res) => {
  const { email, password } = req.body;

  try {
    const response = await axios.get("http://localhost:5000/users");
    const users = response.data;

    const user = users.find((u) => u.email === email && u.password === password);
    if (!user) {
      return res.status(401).json({ error: "Invalid email or password" });
    }

    // Trả về thông tin user (thường sẽ tạo token nhưng ở đây chỉ là demo)
    res.json({
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role
    });
  } catch (error) {
    res.status(500).json({ error: "Server error" });
  }
});

app.listen(port, () => {
  console.log(`Backend running on http://localhost:${port}`);
});
