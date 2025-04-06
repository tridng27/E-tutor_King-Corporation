const { Server } = require("socket.io");
const meetings = {}; // Lưu trạng thái cuộc họp và người tham gia

const setupMeetingService = (server, existingIo = null) => {
  // Use existing io instance if provided, otherwise create a new one
  const io = existingIo || new Server(server, {
    cors: {
      origin: "http://localhost:5173",
      methods: ["GET", "POST"],
      credentials: true,
    },
  });

  // Create a namespace for meetings
  const meetingIo = io.of('/meetings');

  meetingIo.on("connection", (socket) => {
    console.log("New connection to meeting service:", socket.id);
    
    // Xử lý tin nhắn chat
    socket.on("send-message", ({ roomId, message }) => {
      socket.to(roomId).emit("receive-message", message);
    });

    // Xử lý khi người dùng tham gia cuộc họp
    socket.on("join-meeting", ({ meetingId, name }) => {
      console.log(`${name} joining meeting: ${meetingId}`);
      socket.join(meetingId);
      if (!meetings[meetingId]) {
        meetings[meetingId] = { participants: {} };
      }
      meetings[meetingId].participants[socket.id] = { name };
      // Gửi thông báo đến những người đã có trong phòng
      Object.keys(meetings[meetingId].participants)
        .filter((id) => id !== socket.id)
        .forEach((participantId) => {
          meetingIo.to(participantId).emit("user-connected", { userId: socket.id });
        });
      // Cập nhật số lượng người tham gia
      meetingIo.to(meetingId).emit("update-participants", {
        count: Object.keys(meetings[meetingId].participants).length,
      });
    });

    // Xử lý WebRTC signaling
    socket.on("offer", ({ meetingId, offer, to }) => {
      meetingIo.to(to).emit("receive-offer", { from: socket.id, offer });
    });

    socket.on("answer", ({ meetingId, answer, to }) => {
      meetingIo.to(to).emit("receive-answer", { from: socket.id, answer });
    });

    socket.on("ice-candidate", ({ meetingId, candidate, to }) => {
      meetingIo.to(to).emit("receive-ice-candidate", { from: socket.id, candidate });
    });

    // Xử lý khi người dùng rời phòng
    socket.on("leave-meeting", (meetingId) => {
      if (meetings[meetingId] && meetings[meetingId].participants[socket.id]) {
        delete meetings[meetingId].participants[socket.id];
        socket.to(meetingId).emit("user-disconnected", { userId: socket.id });
        meetingIo.to(meetingId).emit("update-participants", {
          count: Object.keys(meetings[meetingId].participants).length,
        });
        if (Object.keys(meetings[meetingId].participants).length === 0) {
          delete meetings[meetingId];
        }
      }
      socket.leave(meetingId);
    });

    // Xử lý khi người dùng mất kết nối
    socket.on("disconnect", () => {
      Object.keys(meetings).forEach((meetingId) => {
        if (meetings[meetingId]?.participants[socket.id]) {
          delete meetings[meetingId].participants[socket.id];
          socket.to(meetingId).emit("user-disconnected", { userId: socket.id });
          meetingIo.to(meetingId).emit("update-participants", {
            count: Object.keys(meetings[meetingId].participants).length,
          });
          if (Object.keys(meetings[meetingId].participants).length === 0) {
            delete meetings[meetingId];
          }
        }
      });
    });
  });

  return meetingIo;
};

module.exports = setupMeetingService;
