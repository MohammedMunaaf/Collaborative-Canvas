import React, { useState, useEffect, useRef } from "react";
import Canvas from "./components/Canvas";
import Toolbar from "./components/Toolbar";
import UserList from "./components/UserList";
import { WebSocketManager } from "./utils/websocket";
import "./App.css";

function App() {
  const [socket, setSocket] = useState(null);
  const [connected, setConnected] = useState(false);
  const [users, setUsers] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);
  const [roomId, setRoomId] = useState("default");
  const [username, setUsername] = useState("");
  const [joined, setJoined] = useState(false);
  const [tool, setTool] = useState("brush");
  const [color, setColor] = useState("#000000");
  const [strokeWidth, setStrokeWidth] = useState(3);
  const [showStats, setShowStats] = useState(false);
  const [latency, setLatency] = useState(0);
  const canvasRef = useRef(null);

  // Initialize WebSocket connection
  useEffect(() => {
    const wsManager = new WebSocketManager(
      process.env.REACT_APP_SERVER_URL || "http://localhost:5000",
    );

    wsManager.connect();

    wsManager.on("connect", () => {
      console.log("Connected to server");
      setConnected(true);
    });

    wsManager.on("disconnect", () => {
      console.log("Disconnected from server");
      setConnected(false);
    });

    wsManager.on("room-state", (data) => {
      setUsers(data.users);
      setCurrentUser(data.currentUser);

      // Load drawing history
      if (canvasRef.current && data.drawingHistory) {
        canvasRef.current.loadHistory(data.drawingHistory);
      }
    });

    wsManager.on("user-joined", (user) => {
      console.log("User joined:", user);
      setUsers((prev) => [...prev, user]);
    });

    wsManager.on("user-left", (data) => {
      console.log("User left:", data);
      setUsers((prev) => prev.filter((u) => u.id !== data.userId));
    });

    wsManager.on("draw", (drawData) => {
      if (canvasRef.current) {
        canvasRef.current.handleRemoteDraw(drawData);
      }
    });

    wsManager.on("cursor-move", (cursorData) => {
      if (canvasRef.current) {
        canvasRef.current.updateRemoteCursor(cursorData);
      }
    });

    wsManager.on("undo", (data) => {
      if (canvasRef.current) {
        canvasRef.current.handleRemoteUndo(data);
      }
    });

    wsManager.on("redo", (data) => {
      if (canvasRef.current) {
        canvasRef.current.handleRemoteRedo(data);
      }
    });

    wsManager.on("clear-canvas", () => {
      if (canvasRef.current) {
        canvasRef.current.clearCanvas();
      }
    });

    // Measure latency
    const latencyInterval = setInterval(() => {
      const start = Date.now();
      wsManager.emit("ping", {}, () => {
        setLatency(Date.now() - start);
      });
    }, 3000);

    setSocket(wsManager);

    return () => {
      clearInterval(latencyInterval);
      wsManager.disconnect();
    };
  }, []);

  const handleJoinRoom = (e) => {
    e.preventDefault();
    if (socket && username.trim()) {
      const room = roomId.trim() || "default";
      socket.emit("join-room", { roomId: room, username: username.trim() });
      setJoined(true);
    }
  };

  const handleToolChange = (newTool) => {
    setTool(newTool);
  };

  const handleColorChange = (newColor) => {
    setColor(newColor);
  };

  const handleStrokeWidthChange = (newWidth) => {
    setStrokeWidth(newWidth);
  };

  const handleUndo = () => {
    if (socket && canvasRef.current) {
      socket.emit("undo");
      canvasRef.current.undo();
    }
  };

  const handleRedo = () => {
    if (socket && canvasRef.current) {
      socket.emit("redo");
      canvasRef.current.redo();
    }
  };

  const handleClear = () => {
    if (socket && canvasRef.current) {
      if (
        window.confirm("Clear the entire canvas? This will affect all users.")
      ) {
        socket.emit("clear-canvas");
        canvasRef.current.clearCanvas();
      }
    }
  };

  const handleSave = () => {
    if (canvasRef.current) {
      canvasRef.current.saveCanvas();
    }
  };

  const handleDownload = () => {
    if (canvasRef.current) {
      canvasRef.current.downloadCanvas();
    }
  };

  if (!joined) {
    return (
      <div className="join-screen">
        <div className="join-container">
          <h1>🎨 Collaborative Canvas</h1>
          <p>Real-time drawing with friends</p>
          <form onSubmit={handleJoinRoom}>
            <input
              type="text"
              placeholder="Your name"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              autoFocus
            />
            <input
              type="text"
              placeholder="Room ID (optional)"
              value={roomId}
              onChange={(e) => setRoomId(e.target.value)}
            />
            <button type="submit" disabled={!connected || !username.trim()}>
              {connected ? "Join Room" : "Connecting..."}
            </button>
          </form>
          <div className="connection-status">
            <span
              className={`status-dot ${connected ? "connected" : "disconnected"}`}
            ></span>
            {connected ? "Connected to server" : "Connecting to server..."}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="app">
      <header className="app-header">
        <div className="header-left">
          <h1>🎨 Collaborative Canvas</h1>
          <span className="room-info">Room: {roomId}</span>
        </div>
        <div className="header-right">
          <button
            className="stats-toggle"
            onClick={() => setShowStats(!showStats)}
          >
            {showStats ? "📊 Hide Stats" : "📊 Show Stats"}
          </button>
        </div>
      </header>

      <div className="app-content">
        <aside className="sidebar left">
          <Toolbar
            tool={tool}
            color={color}
            strokeWidth={strokeWidth}
            onToolChange={handleToolChange}
            onColorChange={handleColorChange}
            onStrokeWidthChange={handleStrokeWidthChange}
            onUndo={handleUndo}
            onRedo={handleRedo}
            onClear={handleClear}
            onSave={handleSave}
            onDownload={handleDownload}
          />
        </aside>

        <main className="canvas-container">
          <Canvas
            ref={canvasRef}
            socket={socket}
            tool={tool}
            color={color}
            strokeWidth={strokeWidth}
            currentUser={currentUser}
          />

          {showStats && (
            <div className="stats-overlay">
              <div className="stat">
                <span>Latency:</span>
                <span className={latency > 100 ? "warning" : "good"}>
                  {latency}ms
                </span>
              </div>
              <div className="stat">
                <span>FPS:</span>
                <span id="fps-counter">60</span>
              </div>
              <div className="stat">
                <span>Users:</span>
                <span>{users.length}</span>
              </div>
            </div>
          )}
        </main>

        <aside className="sidebar right">
          <UserList users={users} currentUser={currentUser} />
        </aside>
      </div>
    </div>
  );
}

export default App;
