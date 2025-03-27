const { Server } = require("socket.io");

const meetings = {}; // Lưu trạng thái cuộc họp và người tham gia

const setupMeetingService = (server) => {
  const io = new Server(server, {
    cors: {
      origin: "http://localhost:5173",
      methods: ["GET", "POST"],
      credentials: true,
    },
  });

  io.on("connection", (socket) => {

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
          io.to(participantId).emit("user-connected", { userId: socket.id });
        });

      // Cập nhật số lượng người tham gia
      io.to(meetingId).emit("update-participants", {
        count: Object.keys(meetings[meetingId].participants).length,
      });
    });

    // Xử lý WebRTC signaling
    socket.on("offer", ({ meetingId, offer, to }) => {
      io.to(to).emit("receive-offer", { from: socket.id, offer });
    });

    socket.on("answer", ({ meetingId, answer, to }) => {
      io.to(to).emit("receive-answer", { from: socket.id, answer });
    });

    socket.on("ice-candidate", ({ meetingId, candidate, to }) => {
      io.to(to).emit("receive-ice-candidate", { from: socket.id, candidate });
    });

    // Xử lý khi người dùng rời phòng
    socket.on("leave-meeting", (meetingId) => {
      if (meetings[meetingId] && meetings[meetingId].participants[socket.id]) {
        delete meetings[meetingId].participants[socket.id];

        socket.to(meetingId).emit("user-disconnected", { userId: socket.id });

        io.to(meetingId).emit("update-participants", {
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
        if (meetings[meetingId].participants[socket.id]) {
          delete meetings[meetingId].participants[socket.id];
          socket.to(meetingId).emit("user-disconnected", { userId: socket.id });

          io.to(meetingId).emit("update-participants", {
            count: Object.keys(meetings[meetingId].participants).length,
          });

          if (Object.keys(meetings[meetingId].participants).length === 0) {
            delete meetings[meetingId];
          }
        }
      });
    });
  });

  return io;
};

module.exports = setupMeetingService;
