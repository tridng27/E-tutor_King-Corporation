// server.js
const express = require("express");
require("dotenv").config();
const cors = require("cors");
const cookieParser = require("cookie-parser"); // Make sure this is installed

// Import models first to ensure they're registered
const db = require("./models");
console.log("Models loaded in server.js:", Object.keys(db));

// Then import routes
const authRoutes = require("./routes/authRoutes");
const postRoutes = require("./routes/postRoute");

// Create Express instance
const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cookieParser()); // Add cookie parser
app.use(cors({
  origin: 'http://localhost:5173', // Your frontend URL (adjust if needed)
  credentials: true // Important for cookies
}));
app.use(express.json());

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/posts", postRoutes);

// Basic route
app.get("/", (req, res) => {
  res.send("Hello World! Server is running.");
});

// Debug route to check routes
app.get("/api/debug/routes", (req, res) => {
  const routes = [];
  
  // Get all registered routes
  app._router.stack.forEach(middleware => {
    if(middleware.route) { // routes registered directly on the app
      routes.push({
        path: middleware.route.path,
        method: Object.keys(middleware.route.methods)[0].toUpperCase()
      });
    } else if(middleware.name === 'router') { // router middleware
      middleware.handle.stack.forEach(handler => {
        if(handler.route) {
          const path = handler.route.path;
          const method = Object.keys(handler.route.methods)[0].toUpperCase();
          routes.push({
            path: middleware.regexp.toString().includes('/api/auth') ? 
              `/api/auth${path}` : 
              (middleware.regexp.toString().includes('/api/posts') ? 
                `/api/posts${path}` : path),
            method: method
          });
        }
      });
    }
  });
  
  res.json(routes);
});

// Sync database and start server
db.sequelize.sync({ alter: true })
  .then(() => {
    console.log('Database synced successfully');
    
    // Start the server after database sync
    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
    });
  })
  .catch(err => {
    console.error('Error syncing database:', err);
    
    // Start server even if sync fails
    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT} (but database sync failed)`);
    });
  });

  // Add this to your server.js file
app.get("/api/debug/routes", (req, res) => {
  const routes = [];
  
  // Get all registered routes
  app._router.stack.forEach(middleware => {
    if(middleware.route) { // routes registered directly on the app
      routes.push({
        path: middleware.route.path,
        method: Object.keys(middleware.route.methods)[0].toUpperCase()
      });
    } else if(middleware.name === 'router') { // router middleware
      middleware.handle.stack.forEach(handler => {
        if(handler.route) {
          const path = handler.route.path;
          const method = Object.keys(handler.route.methods)[0].toUpperCase();
          routes.push({
            path: middleware.regexp.toString().includes('/api/auth') ? 
              `/api/auth${path}` : 
              (middleware.regexp.toString().includes('/api/posts') ? 
                `/api/posts${path}` : path),
            method: method
          });
        }
      });
    }
  });
  
  res.json(routes);
});

