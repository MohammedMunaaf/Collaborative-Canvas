class DrawingStateManager {
  constructor() {
    this.rooms = new Map();
    this.maxHistorySize = 1000; // Limit history to prevent memory issues
  }

  /**
   * Initialize a room's state if it doesn't exist
   */
  initializeRoom(roomId) {
    if (!this.rooms.has(roomId)) {
      this.rooms.set(roomId, {
        history: [],
        undoStack: [],
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

    // Add to history
    room.history.push(operation);

    // Clear undo stack since we have a new operation
    // room.undoStack = [];

    // Limit history size to prevent memory issues
    if (room.history.length > this.maxHistorySize) {
      const removeCount = room.history.length - this.maxHistorySize;
      room.history = room.history.slice(removeCount);
    }

    return operation;
  }

  // Undo the last operation
  undo(roomId) {
    const room = this.rooms.get(roomId);
    if (!room || room.history.length === 0) {
      return null;
    }

    // Get last stroke & remove from history
    const lastOp = room.history.pop();

    // Add to redo stack
    room.undoStack.push(lastOp);

    return lastOp;
  }

  // Redo the last undone operation
  redo(roomId) {
    const room = this.rooms.get(roomId);
    if (!room || room.undoStack.length === 0) {
      return null;
    }

    // Get from undo stack
    const redoneOperation = room.undoStack.pop();

    // Add back to history
    room.history.push(redoneOperation);

    return redoneOperation;
  }

  // Get the current state of a room
  getRoomState(roomId) {
    const room = this.initializeRoom(roomId);

    return {
      history: room.history,
      canUndo: room.history.length > 0,
      canRedo: room.undoStack.length > 0,
      operationCount: room.history.length,
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
    }
  }

  cleanupRoom(roomId) {
    const room = this.rooms.get(roomId);
    if (room) {
      setTimeout(
        () => {
          this.rooms.delete(roomId);
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
      undoStackSize: room.undoStack.length,
      canUndo: room.history.length > 0,
      canRedo: room.history.length > 0,
    };
  }

  // Get operations after a specific timestamp (for late joiners)
  getOperationsSince(roomId, timestamp) {
    const room = this.rooms.get(roomId);
    if (!room) return [];

    return room.history.filter((op) => op.timestamp > timestamp);
  }

  batchAddOperations(roomId, operations) {
    const room = this.initializeRoom(roomId);

    operations.forEach((op) => {
      if (!room.history.find((existing) => existing.id === op.id)) {
        room.history.push(op);
      }
    });

    return room.history.length;
  }
}

module.exports = { DrawingStateManager };
