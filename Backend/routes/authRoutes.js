// routes/authRoutes.js
const express = require("express");
const { register, login, logout, getMe } = require("../controllers/authController");
const verifyToken = require("../middleware/authMiddleware"); // Note the capital M

const router = express.Router();

// Public routes
router.post("/register", register);
router.post("/login", login);
router.post("/logout", logout);

// Protected route - requires authentication
router.get("/me", verifyToken(), getMe);

// Debug route
router.get("/debug", (req, res) => {
  res.json({
    routes: router.stack.map(layer => {
      if (layer.route) {
        return {
          path: layer.route.path,
          methods: Object.keys(layer.route.methods).map(m => m.toUpperCase())
        };
      }
      return null;
    }).filter(Boolean)
  });
});

module.exports = router;
