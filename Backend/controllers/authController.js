// controllers/authController.js
const { registerUser, loginUser } = require("../services/authService");

const register = async (req, res) => {
  try {
    const { email, password, name } = req.body;
    // Tạo user mới với Role là null (chờ admin duyệt)
    const newUser = await registerUser({ email, password, name });
    res.status(201).json({
      message: "Đăng ký thành công, tài khoản của bạn đang chờ admin duyệt.",
      user: newUser,
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    // Đăng nhập: nếu tài khoản chưa được admin duyệt, sẽ ném lỗi
    const { token, user } = await loginUser({ email, password });
    res.status(200).json({ token, user });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

module.exports = { register, login };
