class DrawingStateManager {
  constructor() {
    this.rooms = new Map();
    this.maxHistorySize = 500; // Limit history to prevent memory issues
  }

  /**
   * Initialize a room's state if it doesn't exist
   */
  initializeRoom(roomId) {
    if (!this.rooms.has(roomId)) {
      this.rooms.set(roomId, {
        history: [],
        undoStack: [],
        currentIndex: -1,
        savedStates: new Map(),
        createdAt: Date.now(),
      });
    }
    return this.rooms.get(roomId);
  }

  addDrawing(roomId, drawingData) {
    const room = this.initializeRoom(roomId);

    // Generate unique ID for this operation
    const operation = {
      id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      ...drawingData,
      timestamp: Date.now(),
    };

    // When a new operation is added, clear any redo stack
    if (room.currentIndex < room.history.length - 1) {
      room.history = room.history.slice(0, room.currentIndex + 1);
    }

    // Add to history
    room.history.push(operation);
    room.currentIndex = room.history.length - 1;

    // Clear undo stack since we have a new operation
    room.undoStack = [];

    // Limit history size to prevent memory issues
    if (room.history.length > this.maxHistorySize) {
      const removeCount = room.history.length - this.maxHistorySize;
      room.history = room.history.slice(removeCount);
      room.currentIndex -= removeCount;
    }

    return operation;
  }

  // Undo the last operation
  undo(roomId) {
    const room = this.rooms.get(roomId);
    if (!room || room.currentIndex < 0) {
      return null;
    }

    // Get the operation to undo
    const operation = room.history[room.currentIndex];

    // Move the index back
    room.currentIndex--;

    // Add to undo stack
    room.undoStack.push(operation);

    return operation;
  }

  // Redo the last undone operation

  redo(roomId) {
    const room = this.rooms.get(roomId);
    if (!room || room.currentIndex >= room.history.length - 1) {
      return null;
    }

    // Move the index forward
    room.currentIndex++;

    // Get the operation to redo
    const operation = room.history[room.currentIndex];

    // Remove from undo stack if present
    const undoIndex = room.undoStack.findIndex((op) => op.id === operation.id);
    if (undoIndex !== -1) {
      room.undoStack.splice(undoIndex, 1);
    }

    return operation;
  }

  // Get the current state of a room
  getRoomState(roomId) {
    const room = this.initializeRoom(roomId);

    return {
      history: room.history.slice(0, room.currentIndex + 1),
      canUndo: room.currentIndex >= 0,
      canRedo: room.currentIndex < room.history.length - 1,
      operationCount: room.history.length,
      currentIndex: room.currentIndex,
    };
  }

  getFullHistory(roomId) {
    const room = this.rooms.get(roomId);
    return room ? room.history : [];
  }

  clearRoom(roomId) {
    const room = this.rooms.get(roomId);
    if (room) {
      room.history = [];
      room.undoStack = [];
      room.currentIndex = -1;
    }
  }

  saveCanvas(roomId, canvasData) {
    const room = this.initializeRoom(roomId);
    room.savedStates.set("latest", {
      data: canvasData,
      timestamp: Date.now(),
      operationCount: room.history.length,
    });
  }

  getSavedCanvas(roomId) {
    const room = this.rooms.get(roomId);
    return room?.savedStates.get("latest") || null;
  }

  cleanupRoom(roomId) {
    const room = this.rooms.get(roomId);
    if (room) {
      setTimeout(
        () => {
          this.rooms.delete(roomId);
          console.log(`Drawing state for room ${roomId} cleaned up`);
        },
        10 * 60 * 1000,
      ); // Keeping for 10 minutes for any rejoins
    }
  }

  getRoomStats(roomId) {
    const room = this.rooms.get(roomId);
    if (!room) return null;

    return {
      totalOperations: room.history.length,
      currentIndex: room.currentIndex,
      undoStackSize: room.undoStack.length,
      canUndo: room.currentIndex >= 0,
      canRedo: room.currentIndex < room.history.length - 1,
    };
  }

  // Get operations after a specific timestamp (for late joiners)
  getOperationsSince(roomId, timestamp) {
    const room = this.rooms.get(roomId);
    if (!room) return [];

    return room.history
      .slice(0, room.currentIndex + 1)
      .filter((op) => op.timestamp > timestamp);
  }

  batchAddOperations(roomId, operations) {
    const room = this.initializeRoom(roomId);

    operations.forEach((op) => {
      if (!room.history.find((existing) => existing.id === op.id)) {
        room.history.push(op);
      }
    });

    room.currentIndex = room.history.length - 1;
    return room.history.length;
  }
}

module.exports = { DrawingStateManager };
