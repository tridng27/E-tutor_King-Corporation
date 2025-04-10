const express = require("express");
const http = require("http");
const socketIo = require("socket.io");
const setupMeetingService = require("./services/meetingService");
require("dotenv").config();
const cors = require("cors");
const cookieParser = require("cookie-parser");
const path = require("path");
const nodemailer = require("nodemailer");

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
const uploadRoutes = require("./routes/uploadRoutes");
const resourceRoutes = require("./routes/resourceRoutes");
const adminRoutes = require("./routes/adminRoutes");
const timetableRoutes = require("./routes/timetableRoutes");
const userRoutes = require("./routes/userRoutes");
const directMessageRoutes = require("./routes/directMessageRoutes");
const tutorRoutes = require("./routes/tutorRoutes");
const studentSubjectRoutes = require("./routes/studentSubjectRoutes");
const subjectRoutes = require("./routes/subjectRoutes");

// Environment variables with fallbacks
const PORT = process.env.PORT || 5000;
const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:5173';
const API_BASE_URL = process.env.API_BASE_URL || `http://localhost:${PORT}/api`;

// Import direct message service for socket handling
const directMessageService = require('./services/directMessageService');

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

// Setup Socket.IO ONCE
const io = socketIo(server, {
  cors: {
    origin: FRONTEND_URL, // Use environment variable instead of hardcoded URL
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true
  }
});

// Make io accessible to other modules
app.set('io', io);

// Create a namespace for direct messages
const dmIo = io.of('/direct-messages');

// Socket.IO connection handling for direct messages
dmIo.on('connection', (socket) => {
  console.log('New client connected to direct messages:', socket.id);
  
  // Join a room based on user ID
  socket.on('join', (userID) => {
    if (userID) {
      socket.join(`user_${userID}`);
      console.log(`User ${userID} joined their room: user_${userID}`);
    } else {
      console.log('Join event received but no userID provided');
    }
  });
  
  // Handle new messages
  socket.on('send_message', async (messageData) => {
    try {
      const { senderID, receiverID, content } = messageData;
      
      console.log(`Message data received:`, messageData);
      
      if (!senderID || !receiverID || !content) {
        console.log('Missing required message data');
        socket.emit('error', { message: 'Missing required message data' });
        return;
      }
      
      // Save message to database using existing service
      const savedMessage = await directMessageService.sendMessage(senderID, receiverID, content);
      console.log('Message saved to database:', savedMessage);
      
      // Emit to both sender and receiver rooms
      const senderRoom = `user_${senderID}`;
      const receiverRoom = `user_${receiverID}`;
      
      console.log(`Emitting to rooms: ${senderRoom} and ${receiverRoom}`);
      
      // Emit to sender room
      dmIo.to(senderRoom).emit('receive_message', savedMessage);
      
      // Emit to receiver room
      dmIo.to(receiverRoom).emit('receive_message', savedMessage);
      
      console.log(`Message emitted to both rooms`);
    } catch (error) {
      console.error('Error sending message:', error);
      socket.emit('error', { message: error.message });
    }
  });
  
  // Handle typing indicators
  socket.on('typing', ({ senderID, receiverID, isTyping }) => {
    if (!senderID || !receiverID) {
      console.log('Missing required typing data');
      return;
    }
    
    console.log(`Typing indicator: User ${senderID} is ${isTyping ? 'typing' : 'not typing'} to ${receiverID}`);
    
    // Forward typing status to the receiver room
    const receiverRoom = `user_${receiverID}`;
    socket.to(receiverRoom).emit('user_typing', { 
      userID: senderID, 
      isTyping 
    });
  });
  
  socket.on('disconnect', () => {
    console.log('Client disconnected from direct messages:', socket.id);
  });
});

// Middleware
app.use(cookieParser()); // Add cookie parser before CORS
app.use(
  cors({
    origin: FRONTEND_URL, // Use environment variable instead of hardcoded URL
    credentials: true, // Important for cookies
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);
app.use(express.json());

// Serve static files from uploads directory
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// Debug middleware to log all requests
app.use((req, res, next) => {
  console.log(`${req.method} ${req.url}`);
  next();
});

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/posts", postRoutes);
app.use("/api/students", studentRoutes);
app.use("/api/classes", classRoutes);
app.use("/api/class-students", classStudentRoutes);
app.use("/api/upload", uploadRoutes);
app.use("/api/resources", resourceRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/timetables", timetableRoutes);
app.use("/api/users", userRoutes);
app.use("/api/messages", directMessageRoutes);
app.use("/api/tutor", tutorRoutes);
app.use("/api/studentsubjects", studentSubjectRoutes);
app.use("/api/subjects", subjectRoutes);

// Basic route
app.get("/", (req, res) => {
  res.send("Hello World! Server is running.");
});

// Test cookie route
app.get("/api/test-cookie", (req, res) => {
  res.cookie("test-cookie", "hello-world", {
    httpOnly: false,
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

// Start Meeting Service with the existing io instance
const meetingIo = setupMeetingService(server, io);
console.log('Meeting service initialized with namespace:', meetingIo.name);
// Sync database and start server
db.sequelize
  .sync({ alter: true })
  .then(() => {
    console.log("Database synced successfully");
    server.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
      console.log(`API URL: ${API_BASE_URL}`);
      console.log(`Frontend URL: ${FRONTEND_URL}`);
      console.log(`Socket.IO enabled for real-time messaging`);
      
      // Log email configuration
      console.log(`Email service configured: ${process.env.EMAIL_SERVICE || 'gmail'}`);
      console.log(`Email user: ${process.env.EMAIL_USER ? '✓ Set' : '✗ Not set'}`);
      console.log(`Email password: ${process.env.EMAIL_PASSWORD ? '✓ Set' : '✗ Not set'}`);
    });
  })
  .catch((err) => {
    console.error("Error syncing database:", err);
    server.listen(PORT, () => {
      console.log(`Server is running on port ${PORT} (but database sync failed)`);
    });
  });
