import jwt from "jsonwebtoken";

export function socketAuthenticate(socket, next) {
  try {
    const token = socket.handshake.auth?.token;

    if (!token) {
      return next(new Error("No token provided"));
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    socket.user = {
      id: decoded.userId,
      role: decoded.role,
    };

    next();
  } catch (err) {
    next(new Error("Unauthorized socket"));
  }
}
