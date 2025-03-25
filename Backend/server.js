const express = require("express");
const http = require("http");
const cors = require("cors");
const setupMeetingService = require("./services/meetingService");

const app = express();
const server = http.createServer(app);

app.use(cors());

// Khởi động dịch vụ Meeting
setupMeetingService(server);

server.listen(5000, () => {
  console.log("Server is running on port 5000");
});
