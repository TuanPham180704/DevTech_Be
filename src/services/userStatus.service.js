import pool from "../config/db.js";

export async function updateLastOnline(userId) {
  await pool.query(
    `
    UPDATE users
    SET last_online_at = NOW()
    WHERE id = $1
    `,
    [userId],
  );
}
