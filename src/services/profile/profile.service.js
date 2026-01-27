import pool from "../../config/db.js";
import bcrypt from "bcrypt";
import crypto from "crypto";
import { sendResetEmail } from "../../utils/sendResetEmail.js";

const SALT = 10;
const RESET_EXPIRE_MINUTES = 60;
export async function getMyProfile(userId) {
  const { rows } = await pool.query(
    `
    SELECT
      id,
      email,
      full_name,
      avatar_url,
      date_of_birth,
      gender,
      phone,
      address,
      bio,
      status,
      created_at
    FROM users
    WHERE id = $1
    `,
    [userId],
  );

  if (!rows.length) {
    throw Object.assign(new Error("User not found"), { status: 404 });
  }

  return rows[0];
}
export async function updateMyProfile(userId, data) {
  const { full_name, avatar_url, date_of_birth, gender, phone, address, bio } =
    data;

  await pool.query(
    `
    UPDATE users
    SET
      full_name = COALESCE($1, full_name),
      avatar_url = COALESCE($2, avatar_url),
      date_of_birth = COALESCE($3, date_of_birth),
      gender = COALESCE($4, gender),
      phone = COALESCE($5, phone),
      address = COALESCE($6, address),
      bio = COALESCE($7, bio),
      updated_at = NOW()
    WHERE id = $8
    `,
    [full_name, avatar_url, date_of_birth, gender, phone, address, bio, userId],
  );

  await pool.query(
    `
    INSERT INTO audit_logs (user_id, action)
    VALUES ($1,'UPDATE_PROFILE')
    `,
    [userId],
  );

  return { message: "Profile updated successfully" };
}
export async function changePassword(userId, oldPassword, newPassword) {
  const { rows } = await pool.query(
    `SELECT password_hash FROM users WHERE id = $1`,
    [userId],
  );

  if (!rows.length) {
    throw Object.assign(new Error("User not found"), { status: 404 });
  }

  const isMatch = await bcrypt.compare(oldPassword, rows[0].password_hash);
  if (!isMatch) {
    throw Object.assign(new Error("Old password is incorrect"), {
      status: 400,
    });
  }

  const newHash = await bcrypt.hash(newPassword, SALT);

  await pool.query(
    `
    UPDATE users
    SET password_hash = $1, updated_at = NOW()
    WHERE id = $2
    `,
    [newHash, userId],
  );

  await pool.query(
    `
    INSERT INTO audit_logs (user_id, action)
    VALUES ($1,'CHANGE_PASSWORD')
    `,
    [userId],
  );

  return { message: "Password changed successfully" };
}
export async function forgotPassword(email) {
  const { rows } = await pool.query(
    `
    SELECT id, full_name
    FROM users
    WHERE email = $1 AND status = 'active'
    `,
    [email],
  );

  if (!rows.length) return;

  const user = rows[0];
  const token = crypto.randomBytes(32).toString("hex");
  const expiredAt = new Date();
  expiredAt.setMinutes(expiredAt.getMinutes() + RESET_EXPIRE_MINUTES);

  await pool.query(
    `
    INSERT INTO password_resets (user_id, token, expired_at)
    VALUES ($1,$2,$3)
    `,
    [user.id, token, expiredAt],
  );

  await sendResetEmail(email, token, user.full_name);
}
export async function resetPassword(token, newPassword) {
  const { rows } = await pool.query(
    `
    SELECT pr.user_id
    FROM password_resets pr
    WHERE pr.token = $1
      AND pr.used = false
      AND pr.expired_at > NOW()
    `,
    [token],
  );

  if (!rows.length) {
    throw Object.assign(new Error("Invalid or expired reset token"), {
      status: 400,
    });
  }

  const userId = rows[0].user_id;
  const passwordHash = await bcrypt.hash(newPassword, SALT);

  await pool.query(
    `
    UPDATE users
    SET password_hash = $1, updated_at = NOW()
    WHERE id = $2
    `,
    [passwordHash, userId],
  );

  await pool.query(
    `
    UPDATE password_resets
    SET used = true
    WHERE token = $1
    `,
    [token],
  );

  await pool.query(
    `
    INSERT INTO audit_logs (user_id, action)
    VALUES ($1,'RESET_PASSWORD')
    `,
    [userId],
  );

  return { message: "Password reset successfully" };
}
