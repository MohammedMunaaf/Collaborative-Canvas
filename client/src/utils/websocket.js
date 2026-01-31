import io from "socket.io-client";

export class WebSocketManager {
  constructor(serverUrl) {
    this.serverUrl = serverUrl;
    this.socket = null;
    this.eventHandlers = new Map();
  }

  // Connect to the WebSocket server
  connect() {
    this.socket = io(this.serverUrl, {
      transports: ["websocket", "polling"],
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      reconnectionAttempts: Infinity,
    });

    this.setupDefaultHandlers();
    return this.socket;
  }

  setupDefaultHandlers() {
    this.socket.on("connect", () => {
      console.log("Connected to server");
      this.trigger("connect");
    });

    this.socket.on("disconnect", (reason) => {
      console.log("Disconnected from server:", reason);
      this.trigger("disconnect", reason);
    });

    this.socket.on("connect_error", (error) => {
      console.error("Connection error:", error);
      this.trigger("connect_error", error);
    });

    this.socket.on("reconnect", (attemptNumber) => {
      console.log("Reconnected after", attemptNumber, "attempts");
      this.trigger("reconnect", attemptNumber);
    });

    this.socket.on("reconnect_attempt", (attemptNumber) => {
      console.log("Reconnection attempt", attemptNumber);
      this.trigger("reconnect_attempt", attemptNumber);
    });

    this.socket.on("reconnect_error", (error) => {
      console.error("Reconnection error:", error);
      this.trigger("reconnect_error", error);
    });

    this.socket.on("reconnect_failed", () => {
      console.error("Reconnection failed");
      this.trigger("reconnect_failed");
    });

    this.setupAppHandlers();
  }

  setupAppHandlers() {
    const events = [
      "room-state",
      "user-joined",
      "user-left",
      "draw",
      "cursor-move",
      "undo",
      "redo",
      "clear-canvas",
      "canvas-saved",
      "error",
    ];

    events.forEach((event) => {
      this.socket.on(event, (data) => {
        this.trigger(event, data);
      });
    });
  }

  // Register an event handler
  on(event, handler) {
    if (!this.eventHandlers.has(event)) {
      this.eventHandlers.set(event, []);
    }
    this.eventHandlers.get(event).push(handler);
  }

  // Remove an event handler
  off(event, handler) {
    if (!this.eventHandlers.has(event)) return;

    const handlers = this.eventHandlers.get(event);
    const index = handlers.indexOf(handler);
    if (index > -1) {
      handlers.splice(index, 1);
    }
  }

  // Trigger an event handler
  trigger(event, data) {
    if (!this.eventHandlers.has(event)) return;

    this.eventHandlers.get(event).forEach((handler) => {
      try {
        handler(data);
      } catch (error) {
        console.error(`Error in event handler for ${event}:`, error);
      }
    });
  }

  // Emit an event to the server
  emit(event, data, callback) {
    if (!this.socket || !this.socket.connected) {
      console.warn("Socket not connected, event not sent:", event);
      return;
    }

    if (callback) {
      this.socket.emit(event, data, callback);
    } else {
      this.socket.emit(event, data);
    }
  }

  // Disconnect from the server
  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
    this.eventHandlers.clear();
  }

  // Check if connected
  isConnected() {
    return this.socket && this.socket.connected;
  }

  // Get socket ID
  getSocketId() {
    return this.socket?.id || null;
  }

  // Measure latency (ping)
  measureLatency(callback) {
    if (!this.socket || !this.socket.connected) {
      callback(null);
      return;
    }

    const start = Date.now();
    this.socket.emit("ping", {}, () => {
      const latency = Date.now() - start;
      callback(latency);
    });
  }
}
