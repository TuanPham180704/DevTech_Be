import pool from "../../config/db.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import crypto from "crypto";
import { sendActivateEmail } from "../../utils/sendActivateEmail.js";

dotenv.config();

const SALT = 10;
const INVITE_EXPIRE_HOURS = 24;

export async function inviteUser({ email, fullName, roleId, adminId }) {
  const now = new Date();
  const expiredAt = new Date(
    now.getTime() + INVITE_EXPIRE_HOURS * 60 * 60 * 1000,
  );
  const token = crypto.randomBytes(32).toString("hex");

  const { rows } = await pool.query(
    `
    SELECT * FROM invites
    WHERE email = $1 AND used = false
    `,
    [email],
  );
  if (rows.length) {
    const invite = rows[0];

    if (new Date(invite.expired_at) > now) {
      throw Object.assign(new Error("Invite already sent and still valid"), {
        status: 409,
      });
    }

    await pool.query(
      `
      UPDATE invites
      SET token = $1,
          expired_at = $2,
          full_name = $3,
          created_by = $4,
          created_at = NOW()
      WHERE id = $5
      `,
      [token, expiredAt, fullName, adminId, invite.id],
    );

    await sendActivateEmail(email, token, fullName);

    return { message: "Invite re-sent (expired invite renewed)" };
  }
  await pool.query(
    `
    INSERT INTO invites (email, full_name, role_id, token, expired_at, created_by)
    VALUES ($1,$2,$3,$4,$5,$6)
    `,
    [email, fullName, roleId, token, expiredAt, adminId],
  );

  await sendActivateEmail(email, token, fullName);

  await pool.query(
    `
    INSERT INTO audit_logs (user_id, action, target)
    VALUES ($1,'INVITE_USER',$2)
    `,
    [adminId, email],
  );

  return { message: "Invite sent" };
}
export async function activateAccount(token, password) {
  const { rows } = await pool.query(
    `
    SELECT email, full_name, role_id
    FROM invites
    WHERE token = $1
      AND used = false
      AND expired_at > NOW()
    `,
    [token],
  );

  if (!rows.length) {
    throw Object.assign(new Error("Invalid or expired activation token"), {
      status: 400,
    });
  }

  const invite = rows[0];
  const passwordHash = await bcrypt.hash(password, SALT);
  await pool.query(
    `
    INSERT INTO users (email, password_hash, role_id, full_name, status)
    VALUES ($1,$2,$3,$4,'active')
    `,
    [invite.email, passwordHash, invite.role_id, invite.full_name],
  );

  await pool.query(`UPDATE invites SET used = true WHERE token = $1`, [token]);

  return { message: "Account activated successfully" };
}
export async function login(email, password) {
  const result = await pool.query(
    `
    SELECT
      u.id,
      u.email,
      u.password_hash,
      u.status,
      u.full_name,
      r.name AS role
    FROM users u
    JOIN roles r ON u.role_id = r.id
    WHERE u.email = $1
    `,
    [email],
  );

  if (!result.rows.length) {
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
      fullName: user.full_name,
      role: user.role,
    },
    accessToken,
  };
}
export async function logout(userId, refreshToken) {
  await pool.query(
    `UPDATE refresh_tokens SET revoked = true WHERE token = $1`,
    [refreshToken],
  );

  await pool.query(
    `
    INSERT INTO audit_logs (user_id, action)
    VALUES ($1,'LOGOUT')
    `,
    [userId],
  );
}
