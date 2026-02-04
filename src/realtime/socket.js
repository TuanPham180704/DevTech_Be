import { Server } from "socket.io";
import { socketAuthenticate } from "../middleware/socketAuth.js";
import {
  addOnlineUser,
  removeOnlineUserBySocket,
  getOnlineUsers,
} from "./onlineUsers.js";
import { updateLastOnline } from "../services/userStatus.service.js";

export function initSocket(server) {
  const io = new Server(server, {
    cors: { origin: "*" },
  });

  io.use(socketAuthenticate);
  io.on("connection", async (socket) => {
    const userId = socket.user.id;

    console.log(`🟢 User ${userId} connected`);
    addOnlineUser(userId, socket.id);
    await updateLastOnline(userId);
    io.emit("online_users", getOnlineUsers());
    socket.on("disconnect", () => {
      const disconnectedUserId = removeOnlineUserBySocket(socket.id);
      if (disconnectedUserId) {
        console.log(`🔴 User ${disconnectedUserId} disconnected`);
        io.emit("online_users", getOnlineUsers());
      }
    });
  });
  return io;
}
