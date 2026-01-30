// RoomManager handles user sessions
class RoomManager {
  constructor() {
    this.rooms = new Map();
  }

  
  // Add a user to a room
  addUserToRoom(roomId, user) {
    if (!this.rooms.has(roomId)) {
      this.rooms.set(roomId, {
        id: roomId,
        users: new Map(),
        createdAt: Date.now()
      });
    }

    const room = this.rooms.get(roomId);
    room.users.set(user.id, {
      ...user,
      joinedAt: Date.now()
    });

    return room;
  }

  
  // Remove a user from a room   
  removeUserFromRoom(roomId, userId) {
    const room = this.rooms.get(roomId);
    if (!room) return false;

    return room.users.delete(userId);
  }


  // Get all users in a room
  getRoomUsers(roomId) {
    const room = this.rooms.get(roomId);
    return room ? Array.from(room.users.values()) : [];
  }


  // Get room count
  getRoomCount() {
    return this.rooms.size;
  }
}

module.exports = { RoomManager };