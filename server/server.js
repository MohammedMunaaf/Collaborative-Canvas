const express = require("express");
const http = require("http");
const socketIo = require("socket.io");
const cors = require("cors");
const { RoomManager } = require("./rooms");
const { DrawingStateManager } = require("./drawing-state");

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: process.env.CLIENT_URL || "http://localhost:3000",
    methods: ["GET", "POST"],
  },
});

app.use(cors());
app.use(express.json());

const roomManager = new RoomManager();
const drawingStateManager = new DrawingStateManager();

// checking
app.get("/", (req, res) => {
  res.json({
    status: "ok",
    rooms: roomManager.getRoomCount(),
    users: roomManager.getTotalUsers(),
  });
});

// Get room info
app.get("/rooms/:roomId", (req, res) => {
  const room = roomManager.getRoom(req.params.roomId);
  if (room) {
    res.json(room);
  } else {
    res.status(404).json({ error: "Room not found" });
  }
});

io.on("connection", (socket) => {
  console.log(`User connected: ${socket.id}`);

  let currentRoom = null;
  let currentUser = null;

  socket.on("join-room", ({ roomId, username }) => {
    try {
      if (currentRoom) {
        roomManager.removeUserFromRoom(currentRoom, socket.id);
        socket.leave(currentRoom);
      }

      currentRoom = roomId || "default";
      currentUser = {
        id: socket.id,
        username: username || `User${Math.floor(Math.random() * 1000)}`,
        color: generateUserColor(),
      };

      socket.join(currentRoom);
      roomManager.addUserToRoom(currentRoom, currentUser);

      const roomState = drawingStateManager.getRoomState(currentRoom);
      socket.emit("room-state", {
        users: roomManager.getRoomUsers(currentRoom),
        drawingHistory: roomState.history,
        currentUser,
      });

      // Notify others in the room
      socket.to(currentRoom).emit("user-joined", currentUser);

      console.log(`User ${currentUser.username} joined room ${currentRoom}`);
    } catch (error) {
      console.error("Error joining room:", error);
      socket.emit("error", { message: "Failed to join room" });
    }
  });

  socket.on("draw", (drawData) => {
    if (!currentRoom) return;

    try {
      const enrichedData = {
        ...drawData,
        userId: socket.id,
        username: currentUser?.username,
        timestamp: Date.now(),
      };

      drawingStateManager.addDrawing(currentRoom, enrichedData);

      // Broadcast to all other users in the room
      socket.to(currentRoom).emit("draw", enrichedData);
    } catch (error) {
      console.error("Error handling draw event:", error);
    }
  });

  // Handle cursor movement
  socket.on("cursor-move", (cursorData) => {
    if (!currentRoom) return;

    socket.to(currentRoom).emit("cursor-move", {
      ...cursorData,
      userId: socket.id,
      username: currentUser?.username,
      color: currentUser?.color,
    });
  });

  // Handle undo operation
  socket.on("undo", () => {
    if (!currentRoom) return;

    try {
      const undoneOperation = drawingStateManager.undo(currentRoom);

      if (undoneOperation) {
        // Broadcast undo to all users in the room
        io.to(currentRoom).emit("undo", {
          operationId: undoneOperation.id,
          userId: socket.id,
        });
      }
    } catch (error) {
      console.error("Error handling undo:", error);
    }
  });

  // Handle redo operation
  socket.on("redo", () => {
    if (!currentRoom) return;

    try {
      const redoneOperation = drawingStateManager.redo(currentRoom);

      if (redoneOperation) {
        // Broadcast redo to all users in the room
        io.to(currentRoom).emit("redo", {
          operation: redoneOperation,
          userId: socket.id,
        });
      }
    } catch (error) {
      console.error("Error handling redo:", error);
    }
  });

  // Handle clear canvas
  socket.on("clear-canvas", () => {
    if (!currentRoom) return;

    try {
      drawingStateManager.clearRoom(currentRoom);
      io.to(currentRoom).emit("clear-canvas", { userId: socket.id });
    } catch (error) {
      console.error("Error clearing canvas:", error);
    }
  });

  // Handle disconnect
  socket.on("disconnect", () => {
    console.log(`User disconnected: ${socket.id}`);

    if (currentRoom && currentUser) {
      roomManager.removeUserFromRoom(currentRoom, socket.id);
      socket.to(currentRoom).emit("user-left", {
        userId: socket.id,
        username: currentUser.username,
      });

      // Clean up empty rooms
      if (roomManager.getRoomUsers(currentRoom).length === 0) {
        drawingStateManager.cleanupRoom(currentRoom);
      }
    }
  });

  // Handle errors
  socket.on("error", (error) => {
    console.error("Socket error:", error);
  });
});

// Generate a random color for each user
function generateUserColor() {
  const colors = [
    "#FF6B6B",
    "#4ECDC4",
    "#45B7D1",
    "#FFA07A",
    "#98D8C8",
    "#F7DC6F",
    "#BB8FCE",
    "#85C1E2",
    "#F8B739",
    "#52B788",
  ];
  return colors[Math.floor(Math.random() * colors.length)];
}

const PORT = process.env.PORT || 5000;

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(
    `Accepting connections from ${process.env.CLIENT_URL || "http://localhost:3000"}`,
  );
});

// shutdown
process.on("SIGTERM", () => {
  console.log("SIGTERM signal received: closing HTTP server");
  server.close(() => {
    console.log("HTTP server closed");
  });
});
