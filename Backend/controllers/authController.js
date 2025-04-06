// controllers/authController.js
const { registerUser, loginUser } = require("../services/authService");

const register = async (req, res) => {
  try {
    const { email, password, name, requestedRole } = req.body;
    // Tạo user mới với Role là null (chờ admin duyệt)
    const newUser = await registerUser({ email, password, name, requestedRole });
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
    const { token, user } = await loginUser({ email, password });
    
    // Set token as HttpOnly cookie
    res.cookie('token', token, {
      httpOnly: true,
      secure: false,
      sameSite: 'lax',
      maxAge: 24 * 60 * 60 * 1000,
      path: '/'
    });
    
    // Also return the token in the response as a fallback
    res.status(200).json({ user, token });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

const logout = async (req, res) => {
  try {
    // Clear the token cookie
    res.clearCookie('token');
    res.status(200).json({ message: "Logged out successfully" });
  } catch (error) {
    res.status(500).json({ message: "Error logging out" });
  }
};

const getMe = async (req, res) => {
  try {
    // Log the user object from the request for debugging
    console.log("getMe endpoint called, user from token:", req.user);
    
    // req.user is set by the verifyToken middleware
    const User = require("../models/user");
    
    // Use UserID from the token (not id)
    const userId = req.user.UserID;
    
    if (!userId) {
      console.error("No UserID found in token payload:", req.user);
      return res.status(401).json({ message: "Invalid token payload" });
    }
    
    // Find the user in the database to get the most up-to-date information
    const user = await User.findByPk(userId, {
      attributes: { exclude: ['Password'] } // Don't return the password
    });
    
    if (!user) {
      console.log("User not found in database:", userId);
      return res.status(404).json({ message: "User not found" });
    }
    
    console.log("User found, returning:", user.toJSON());
    res.status(200).json({ 
      user: user.toJSON()
    });
  } catch (error) {
    console.error("Error in getMe:", error);
    res.status(401).json({ message: "Authentication failed", error: error.message });
  }
};

module.exports = { register, login, logout, getMe };
