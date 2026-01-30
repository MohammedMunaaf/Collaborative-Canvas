import React, { useState } from "react";
import "./App.css";

function App() {
  const [username, setUsername] = useState("");
  const [joined, setJoined] = useState(false);

  const handleJoinRoom = (e) => {
    e.preventDefault();
    if (username.trim()) {
      // TODO: Connect to WebSocket
      setJoined(true);
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
            <button type="submit">Join Room</button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="app">
      <header className="app-header">
        <div className="header-left">
          <h1>🎨 Collaborative Canvas</h1>
        </div>
      </header>
    </div>
  );
}

export default App;
