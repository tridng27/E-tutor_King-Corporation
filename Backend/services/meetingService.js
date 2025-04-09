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
  const meetingIo = io.of('/meeting');

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
      
      // Add the new participant
      meetings[meetingId].participants[socket.id] = { name };
      
      // Send the list of existing participants to the new user
      const existingParticipants = Object.keys(meetings[meetingId].participants)
        .filter(id => id !== socket.id)
        .map(id => ({
          id,
          name: meetings[meetingId].participants[id].name
        }));
      
      socket.emit("existing-participants", { participants: existingParticipants });
      
      // Notify existing participants about the new user
      socket.to(meetingId).emit("user-connected", { 
        userId: socket.id,
        name: name 
      });
      
      // Update participant count for everyone
      meetingIo.to(meetingId).emit("update-participants", {
        count: Object.keys(meetings[meetingId].participants).length,
        participants: Object.entries(meetings[meetingId].participants).map(([id, data]) => ({
          id,
          name: data.name
        }))
      });
    });

    // Xử lý WebRTC signaling
    socket.on("offer", ({ meetingId, offer, to }) => {
      console.log(`Sending offer from ${socket.id} to ${to}`);
      meetingIo.to(to).emit("receive-offer", { 
        from: socket.id, 
        offer,
        name: meetings[meetingId]?.participants[socket.id]?.name 
      });
    });

    socket.on("answer", ({ meetingId, answer, to }) => {
      console.log(`Sending answer from ${socket.id} to ${to}`);
      meetingIo.to(to).emit("receive-answer", { from: socket.id, answer });
    });

    socket.on("ice-candidate", ({ meetingId, candidate, to }) => {
      meetingIo.to(to).emit("receive-ice-candidate", { from: socket.id, candidate });
    });

    // Xử lý khi người dùng rời phòng
    socket.on("leave-meeting", (meetingId) => {
      handleUserLeaving(socket, meetingId);
    });

    // Xử lý khi người dùng mất kết nối
    socket.on("disconnect", () => {
      console.log(`User disconnected: ${socket.id}`);
      Object.keys(meetings).forEach((meetingId) => {
        if (meetings[meetingId]?.participants[socket.id]) {
          handleUserLeaving(socket, meetingId);
        }
      });
    });
    
    // Helper function to handle user leaving
    function handleUserLeaving(socket, meetingId) {
      if (meetings[meetingId] && meetings[meetingId].participants[socket.id]) {
        const userName = meetings[meetingId].participants[socket.id].name;
        delete meetings[meetingId].participants[socket.id];
        
        socket.to(meetingId).emit("user-disconnected", { 
          userId: socket.id,
          name: userName 
        });
        
        meetingIo.to(meetingId).emit("update-participants", {
          count: Object.keys(meetings[meetingId].participants).length,
          participants: Object.entries(meetings[meetingId].participants).map(([id, data]) => ({
            id,
            name: data.name
          }))
        });
        
        if (Object.keys(meetings[meetingId].participants).length === 0) {
          delete meetings[meetingId];
          console.log(`Meeting ${meetingId} ended - no participants left`);
        }
      }
      socket.leave(meetingId);
    }
  });

  return meetingIo;
};

module.exports = setupMeetingService;
