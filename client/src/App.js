import React, { useState, useRef } from 'react';
import Canvas from './components/Canvas';
import Toolbar from './components/Toolbar';
import UserList from './components/UserList';
import './App.css';

function App() {
  const [users, setUsers] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);
  const [username, setUsername] = useState('');
  const [joined, setJoined] = useState(false);
  const [tool, setTool] = useState('brush');
  const [color, setColor] = useState('#000000');
  const [strokeWidth, setStrokeWidth] = useState(3);
  const canvasRef = useRef(null);

  const handleJoinRoom = (e) => {
    e.preventDefault();
    if (username.trim()) {
      // TODO: Connect to WebSocket
      setJoined(true);
      setCurrentUser({ username: username.trim() });
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

      <div className="app-content">
        <aside className="sidebar left">
          <Toolbar
            tool={tool}
            color={color}
            strokeWidth={strokeWidth}
            onToolChange={setTool}
            onColorChange={setColor}
            onStrokeWidthChange={setStrokeWidth}
          />
        </aside>

        <main className="canvas-container">
          <Canvas
            ref={canvasRef}
            tool={tool}
            color={color}
            strokeWidth={strokeWidth}
            currentUser={currentUser}
          />
        </main>

        <aside className="sidebar right">
          <UserList users={users} currentUser={currentUser} />
        </aside>
      </div>
    </div>
  );
}

export default App;