const onlineUsers = new Map();
export function addOnlineUser(userId, socketId) {
  onlineUsers.set(userId, socketId);
}

export function removeOnlineUserBySocket(socketId) {
  for (const [userId, sId] of onlineUsers.entries()) {
    if (sId === socketId) {
      onlineUsers.delete(userId);
      return userId;
    }
  }
  return null;
}

export function getOnlineUsers() {
  return Array.from(onlineUsers.keys());
}
