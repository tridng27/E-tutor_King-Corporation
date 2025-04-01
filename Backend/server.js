const express = require("express");
const http = require("http");
const setupMeetingService = require("./services/meetingService");
require("dotenv").config();
const cors = require("cors");
const cookieParser = require("cookie-parser");
const path = require("path"); // Add this line to import path module
const nodemailer = require("nodemailer"); // Add nodemailer

// Import models first to ensure they're registered
const db = require("./models");
console.log("Models loaded in server.js:", Object.keys(db));

// Then import routes
const authRoutes = require("./routes/authRoutes");
const studentRoutes = require("./routes/studentRoutes");
const classRoutes = require("./routes/classRoutes");
const classStudentRoutes = require("./routes/classstudentRoutes");
const sequelize = require("./config/Database"); // Import database
const postRoutes = require("./routes/postRoute");
const uploadRoutes = require("./routes/uploadRoutes"); // Add this line to import upload routes
const resourceRoutes = require("./routes/resourceRoutes");
const adminRoutes = require("./routes/adminRoutes"); // Add admin routes
const timetableRoutes = require("./routes/timetableRoutes"); // Add timetable routes
const userRoutes = require("./routes/userRoutes"); // Add user routes
const directMessageRoutes = require("./routes/directMessageRoutes"); // Add direct message routes
const tutorRoutes = require("./routes/tutorRoutes"); // Add tutor routes
const studentSubjectRoutes = require("./routes/studentSubjectRoutes"); // Add student subject routes
const subjectRoutes = require("./routes/subjectRoutes");

// Create email service
const emailService = {
  transporter: nodemailer.createTransport({
    service: process.env.EMAIL_SERVICE || 'gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASSWORD
    }
  }),

  sendEmail: async function(to, subject, html) {
    try {
      const mailOptions = {
        from: process.env.EMAIL_USER,
        to,
        subject,
        html
      };

      const info = await this.transporter.sendMail(mailOptions);
      console.log('Email sent: ', info.messageId);
      return true;
    } catch (error) {
      console.error('Error sending email:', error);
      return false;
    }
  },

  sendClassAssignmentNotification: async function(user, className, role) {
    const subject = `You've been assigned to ${className}`;
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2>Class Assignment Notification</h2>
        <p>Hello ${user.Name},</p>
        <p>You have been assigned as a <strong>${role}</strong> to the class: <strong>${className}</strong>.</p>
        <p>Please log in to your account to view more details.</p>
        <p>Thank you,<br>E-tutor King Corporation</p>
      </div>
    `;

    return await this.sendEmail(user.Email, subject, html);
  }
};

// Make email service available globally
global.emailService = emailService;

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
app.use("/api/classes", classRoutes);
app.use("/api/class-students", classStudentRoutes);
app.use("/api/upload", uploadRoutes); // Add this line to register upload routes
app.use("/api/resources", resourceRoutes);
app.use("/api/admin", adminRoutes); // Register admin routes
app.use("/api/timetables", timetableRoutes); // Register timetable routes
app.use("/api/users", userRoutes); // Register user routes
app.use("/api/messages", directMessageRoutes); // Register direct message routes
app.use("/api/tutor", tutorRoutes); // Register tutor routes
app.use("/api/studentsubjects", studentSubjectRoutes); // Register student subject routes
app.use("/api/subjects", subjectRoutes);

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

// Test email route
app.get("/api/test-email", async (req, res) => {
  try {
    const result = await emailService.sendEmail(
      process.env.TEST_EMAIL || process.env.EMAIL_USER,
      'Test Email from E-tutor Application',
      '<h1>This is a test email</h1><p>If you received this, the email service is working correctly!</p>'
    );
    res.json({ 
      success: result, 
      message: "Test email sent. Check the console for details."
    });
  } catch (error) {
    res.status(500).json({ 
      error: error.message,
      message: "Failed to send test email"
    });
  }
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
      
      // Log email configuration
      console.log(`Email service configured: ${process.env.EMAIL_SERVICE || 'gmail'}`);
      console.log(`Email user: ${process.env.EMAIL_USER ? '✓ Set' : '✗ Not set'}`);
      console.log(`Email password: ${process.env.EMAIL_PASSWORD ? '✓ Set' : '✗ Not set'}`);
    });
  })
  .catch((err) => {
    console.error("Error syncing database:", err);
    const PORT = process.env.PORT || 5000;
    server.listen(PORT, () => {
      console.log(`Server is running on port ${PORT} (but database sync failed)`);
    });
  });
