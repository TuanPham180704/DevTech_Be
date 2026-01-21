import pool from "../../config/db.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
dotenv.config();
export async function login(email, password) {
  const result = await pool.query(
    `SELECT
          u.id,
          u.email,
          u.password_hash,
          u.status,
          r.name AS role
        FROM users u
        JOIN roles r ON u.role_id = r.id
        WHERE u.email = $1
        `,
    [email],
  );
  if (result.rows.length == 0) {
    throw Object.assign(new Error("Invalid credentials"), { status: 401 });
  }
  const user = result.rows[0];
  if (user.status !== "active") {
    throw Object.assign(new Error("Account is not active"), { status: 403 });
  }
  const isMatch = await bcrypt.compare(password, user.password_hash);
  if (!isMatch) {
    throw Object.assign(new Error("Invalid credentials"), { status: 401 });
  }
  const accessToken = jwt.sign(
    { userId: user.id, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: "15m" },
  );
  return {
    user: {
      id: user.id,
      email: user.email,
      role: user.role,
    },
    accessToken,
  };
}
