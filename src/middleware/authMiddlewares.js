import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import pool from "../config/db";
dotenv.config();

export async function authenticate(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader) return res.status(401).json({ message: "Missing token" });
  const token = authHeader.split(" ")[1];
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const { rows } = await pool.query(
      `
      SELECT id, email, role_id, status
      FROM users
      WHERE id = $1
      `,
      [decoded.userId],
    );
    if (!rows.length)
      return res.status(401).json({ message: "User not found" });
    const user = rows[0];

    if (user.status === "locked")
      return res.status(403).json({ message: "Account locked" });
    req.user = user;
    next();
  } catch (err) {
    return res.status(401).json({ message: "Invalid or expired token" });
  }
}

export function authorization(roles = []) {
  return (req, res, next) => {
    if (!roles.includes(req.user.role_id)) {
      return res.status(403).json({ message: "Forbidden" });
    }
    next();
  };
}
