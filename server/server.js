const express = require("express");
const http = require("http");
const socketIo = require("socket.io");
const cors = require("cors");

const app = express();
const server = http.createServer(app);
const io = socketIo(
  server,
  {
    cors: {
      origin: "http://localhost:3000",
      methods: ["GET", "POST"],
    },
  },
);

app.use(cors());
app.use(express.json());

// Store active users
const rooms = new Map();

// Checking
app.get("/", (req, res) => {
  res.json({ status: "ok" });
});

io.on("connection", (socket) => {
  console.log(`User connected: ${socket.id}`);

  // Handle user joining a room
  socket.on("join-room", ({ roomId, username }) => {
    const room = roomId || "default";
    socket.join(room);

    // Store user info
    if (!rooms.has(room)) {
      rooms.set(room, new Map());
    }

    const user = {
      id: socket.id,
      username: username || `User${Math.floor(Math.random() * 1000)}`,
      color: generateUserColor(),
    };

    rooms.get(room).set(socket.id, user);

    // Notify user
    socket.emit("room-joined", { user, room });

    // Notify others
    socket.to(room).emit("user-joined", user);

    console.log(`${username} joined room ${room}`);
  });

  // Handle drawing events
  socket.on("draw", (drawData) => {
    // Broadcast to others in the same room
    const room = Array.from(socket.rooms)[1]; // Get the room the user is in
    if (room) {
      socket.to(room).emit("draw", {
        ...drawData,
        userId: socket.id,
      });
    }
  });

  // Handle disconnect
  socket.on("disconnect", () => {
    console.log(`User disconnected: ${socket.id}`);

    // Remove user from all rooms
    for (const [roomId, users] of rooms.entries()) {
      if (users.has(socket.id)) {
        const user = users.get(socket.id);
        users.delete(socket.id);

        io.to(roomId).emit("user-left", {
          userId: socket.id,
          username: user.username,
        });

        // Clean up empty rooms
        if (users.size === 0) {
          rooms.delete(roomId);
        }
      }
    }
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

const PORT = process.env.PORT || 3001;

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
