class RoomManager {
  constructor() {
    this.rooms = new Map();
  }

  // Add a user to a specific room
  addUserToRoom(roomId, user) {
    if (!this.rooms.has(roomId)) {
      this.rooms.set(roomId, {
        id: roomId,
        users: new Map(),
        createdAt: Date.now(),
      });
    }

    const room = this.rooms.get(roomId);
    room.users.set(user.id, {
      ...user,
      joinedAt: Date.now(),
    });

    return room;
  }

  // Remove a user from a room
  removeUserFromRoom(roomId, userId) {
    const room = this.rooms.get(roomId);
    if (!room) return false;

    const removed = room.users.delete(userId);

    // Clean up empty rooms after 5 minutes
    if (room.users.size === 0) {
      setTimeout(
        () => {
          const currentRoom = this.rooms.get(roomId);
          if (currentRoom && currentRoom.users.size === 0) {
            this.rooms.delete(roomId);
          }
        },
        5 * 60 * 1000,
      );
    }

    return removed;
  }

  // Get all users in a room
  getRoomUsers(roomId) {
    const room = this.rooms.get(roomId);
    return room ? Array.from(room.users.values()) : [];
  }

  // Get room information
  getRoom(roomId) {
    const room = this.rooms.get(roomId);
    if (!room) return null;

    return {
      id: room.id,
      userCount: room.users.size,
      users: Array.from(room.users.values()),
      createdAt: room.createdAt,
    };
  }

  // Check if a user is in a room
  isUserInRoom(roomId, userId) {
    const room = this.rooms.get(roomId);
    return room ? room.users.has(userId) : false;
  }

  // Get all rooms
  getAllRooms() {
    return Array.from(this.rooms.values()).map((room) => ({
      id: room.id,
      userCount: room.users.size,
      createdAt: room.createdAt,
    }));
  }

  // Get total number of rooms
  getRoomCount() {
    return this.rooms.size;
  }

  // Get total number of users across all rooms
  getTotalUsers() {
    let total = 0;
    for (const room of this.rooms.values()) {
      total += room.users.size;
    }
    return total;
  }

  // Update user information in a room
  updateUser(roomId, userId, updates) {
    const room = this.rooms.get(roomId);
    if (!room || !room.users.has(userId)) return false;

    const user = room.users.get(userId);
    room.users.set(userId, { ...user, ...updates });
    return true;
  }
}

module.exports = { RoomManager };
