const express = require("express");
const http = require("http");
const setupMeetingService = require("./services/meetingService");
require("dotenv").config();
const cors = require("cors");
const cookieParser = require("cookie-parser");
const path = require("path"); // Add this line to import path module

// Import models first to ensure they're registered
const db = require("./models");
console.log("Models loaded in server.js:", Object.keys(db));

// Then import routes
const authRoutes = require("./routes/authRoutes");
const studentRoutes = require("./routes/studentRoutes");
const sequelize = require("./config/Database"); // Import database
const postRoutes = require("./routes/postRoute");
const uploadRoutes = require("./routes/uploadRoutes"); // Add this line to import upload routes
const resourceRoutes = require("./routes/resourceRoutes");
const adminRoutes = require("./routes/adminRoutes"); // Add admin routes

// Create Express instance
const app = express();
const server = http.createServer(app);

// Middleware
app.use(cookieParser()); // Add cookie parser before CORS
app.use(
  cors({
    origin: "http://localhost:5173", // Your frontend URL
    credentials: true, // Important for cookies
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);
app.use(express.json());

// Serve static files from uploads directory
app.use("/uploads", express.static(path.join(__dirname, "uploads"))); // Add this line for static file serving

// Debug middleware to log all requests
app.use((req, res, next) => {
  console.log(`${req.method} ${req.url}`);
  console.log("Headers:", req.headers);
  console.log("Cookies:", req.cookies);
  next();
});

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/posts", postRoutes);
app.use("/api/students", studentRoutes);
app.use("/api/upload", uploadRoutes); // Add this line to register upload routes
app.use("/api/resources", resourceRoutes);
app.use("/api/admin", adminRoutes); // Register admin routes

// Basic route
app.get("/", (req, res) => {
  res.send("Hello World! Server is running.");
});

// Debug route to check auth routes
app.get("/api/debug/auth-routes", (req, res) => {
  const routes = [];
  authRoutes.stack.forEach((layer) => {
    if (layer.route) {
      const path = layer.route.path;
      const methods = Object.keys(layer.route.methods).map((m) => m.toUpperCase());
      routes.push({ path, methods });
    }
  });
  res.json(routes);
});

// Test cookie route
app.get("/api/test-cookie", (req, res) => {
  res.cookie("test-cookie", "hello-world", {
    httpOnly: false, // Make it visible to JavaScript for testing
    secure: false,
    sameSite: "lax",
    maxAge: 60 * 60 * 1000, // 1 hour
  });
  res.json({ message: "Test cookie set" });
});

// Start Meeting Service
setupMeetingService(server);

// Sync database and start server
db.sequelize
  .sync({ alter: true })
  .then(() => {
    console.log("Database synced successfully");
    const PORT = process.env.PORT || 5000;
    server.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
      console.log(`API URL: http://localhost:${PORT}/api`);
      console.log(`Frontend URL: http://localhost:5173`);
    });
  })
  .catch((err) => {
    console.error("Error syncing database:", err);
    const PORT = process.env.PORT || 5000;
    server.listen(PORT, () => {
      console.log(`Server is running on port ${PORT} (but database sync failed)`);
    });
  });
