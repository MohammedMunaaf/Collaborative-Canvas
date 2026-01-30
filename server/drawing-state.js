// DrawingStateManager handles canvas state
class DrawingStateManager {
  constructor() {
    this.rooms = new Map();
  }


  // Initialize a room's state
  initializeRoom(roomId) {
    if (!this.rooms.has(roomId)) {
      this.rooms.set(roomId, {
        history: [],
        createdAt: Date.now()
      });
    }
    return this.rooms.get(roomId);
  }


  // Add a drawing operation
  addDrawing(roomId, drawingData) {
    const room = this.initializeRoom(roomId);

    const operation = {
      id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      ...drawingData,
      timestamp: Date.now()
    };

    room.history.push(operation);

    return operation;
  }


  // Get room state
  getRoomState(roomId) {
    const room = this.initializeRoom(roomId);
    
    return {
      history: room.history
    };
  }


  // Clear room
  clearRoom(roomId) {
    const room = this.rooms.get(roomId);
    if (room) {
      room.history = [];
    }
  }
}

module.exports = { DrawingStateManager };