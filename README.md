# 🎨 Real-Time Collaborative Drawing Canvas

A real-time, multi-user collaborative drawing application that allows multiple participants to draw simultaneously on a shared canvas with instant synchronization.


## Overview

This project demonstrates real-time collaboration using WebSockets, enabling multiple users to interact with a shared drawing surface concurrently. It focuses on synchronization, performance, and user experience, making it suitable as a scalable collaborative system prototype.


## Key Features

### Core Functionality
- Real-time synchronized drawing across multiple users
- Brush and eraser tools with adjustable stroke width
- Color selection with predefined and custom options
- Live cursor indicators for active users
- Global undo and redo functionality shared across users
- Multi-room support with isolated canvas states
- Online user list with unique visual identifiers

### Additional Capabilities
- Mobile and touch-device support
- Automatic reconnection on network interruptions
- Canvas persistence with download support
- Basic performance metrics (FPS and latency)


## Tech Stack

**Frontend**
- React.js
- HTML5 Canvas
- CSS

**Backend**
- Node.js
- Express.js
- Socket.io (WebSockets)


## Getting Started

### Prerequisites
- Node.js (v14 or higher)
- npm or yarn

### Installation & Setup

1. **Clone the repository**
```bash
git clone <repository-url>
cd collaborative-canvas
```

2. **Install server dependencies**
```bash
cd server
npm install
```

3. **Install client dependencies**
```bash
cd ../client
npm install
```

4. **Start the backend server**
```bash
cd ../server
npm start
```

Server runs on: http://localhost:3001

5. **Start the frontend application**
```bash
cd ../client
npm start
```

Client runs on: http://localhost:3000

## Usage

### Local Multi-User Testing
1. Open [http://localhost:3000](http://localhost:3000) in multiple browser tabs or devices.
2. Enter different usernames.
3. Join the same **Room ID**.
4. Start drawing and observe real-time synchronization across all screens.

## Project Structure

```text
collaborative-canvas/
├── client/                 # React frontend
│   ├── public/
│   └── src/
│       ├── components/     # UI components
│       ├── utils/          # WebSocket handling
│       ├── App.js
│       └── index.js
├── server/                 # Node.js backend
│   ├── server.js           # Express + Socket.io server
│   ├── rooms.js            # Room management
│   └── drawing-state.js    # Canvas state handling
├── README.md
└── ARCHITECTURE.md
```

## Configuration

### Server
```javascript
const PORT = process.env.PORT || 5000;
```

### Client Environment
Create a file named .env in the client/ directory:

```Plaintext
REACT_APP_SERVER_URL=http://localhost:3001
```

## Known Limitations
* Canvas state is stored in memory and resets on server restart
* No user authentication or authorization
* Best supported on Chromium-based browsers and Firefox
* Performance may degrade on high-latency networks

## Performance Notes
* Low-latency synchronization on local networks
* Optimized canvas updates to maintain smooth rendering
* Tested with multiple concurrent users per room

## Development Notes
This project was built to demonstrate:
* **Real-time systems** using WebSockets
* **State synchronization** across distributed clients
* **Interactive canvas-based UI** design
* **Scalable room-based collaboration** architecture


## Time Spent

Total development time: ~4 days (~22-26 hours)

Includes:
- Architecture & planning
- Canvas implementation
- Real-time synchronization
- Undo/redo logic
- Testing & debugging
- Documentation


---

## Closing

This assignment was completed by focusing on the core requirements and expected technical challenges.  
The implementation prioritizes correctness, real-time behavior, and clean code over unnecessary complexity.

**Thank you**.
