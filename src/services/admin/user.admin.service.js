import pool from "../../config/db.js";

export async function getAllUsers() {
  const { rows } = await pool.query(`
    SELECT
      u.id,
      u.email,
      u.full_name,
      u.avatar_url,
      u.date_of_birth,
      u.gender,
      u.phone,
      u.address,
      u.bio,
      u.role_id,
      r.name AS role_name,
      u.status,
      u.created_at
    FROM users u
    JOIN roles r ON u.role_id = r.id
    ORDER BY u.created_at DESC
  `);

  return rows;
}
export async function getUserById(userId) {
  const { rows } = await pool.query(
    `
    SELECT
      u.id,
      u.email,
      u.full_name,
      u.avatar_url,
      u.date_of_birth,
      u.gender,
      u.phone,
      u.address,
      u.bio,
      u.role_id,
      r.name AS role_name,
      u.status,
      u.created_at,
      u.updated_at
    FROM users u
    JOIN roles r ON u.role_id = r.id
    WHERE u.id = $1
    `,
    [userId],
  );

  if (!rows.length) {
    throw Object.assign(new Error("User not found"), { status: 404 });
  }

  return rows[0];
}
export async function updateUser(userId, data, adminId) {
  const {
    email,
    full_name,
    avatar_url,
    date_of_birth,
    gender,
    phone,
    address,
    bio,
    role_id,
  } = data;

  const { rows } = await pool.query(
    `
    UPDATE users
    SET
      email = COALESCE($1, email),
      full_name = COALESCE($2, full_name),
      avatar_url = COALESCE($3, avatar_url),
      date_of_birth = COALESCE($4, date_of_birth),
      gender = COALESCE($5, gender),
      phone = COALESCE($6, phone),
      address = COALESCE($7, address),
      bio = COALESCE($8, bio),
      role_id = COALESCE($9, role_id),
      updated_at = NOW()
    WHERE id = $10
    RETURNING
      id, email, full_name, avatar_url,
      date_of_birth, gender, phone, address,
      bio, role_id, status
    `,
    [
      email,
      full_name,
      avatar_url,
      date_of_birth,
      gender,
      phone,
      address,
      bio,
      role_id,
      userId,
    ],
  );

  if (!rows.length) {
    throw Object.assign(new Error("User not found"), { status: 404 });
  }

  await pool.query(
    `
    INSERT INTO audit_logs (user_id, action, target)
    VALUES ($1,'UPDATE_USER',$2)
    `,
    [adminId, userId],
  );

  return rows[0];
}
export async function changeUserStatus(userId, status, adminId) {
  if (!["active", "locked", "inactive"].includes(status)) {
    throw Object.assign(new Error("Invalid status"), { status: 400 });
  }

  const { rows } = await pool.query(
    `
    UPDATE users
    SET status = $1, updated_at = NOW()
    WHERE id = $2
    RETURNING id, email, status
    `,
    [status, userId],
  );

  if (!rows.length) {
    throw Object.assign(new Error("User not found"), { status: 404 });
  }

  await pool.query(
    `
    INSERT INTO audit_logs (user_id, action, target)
    VALUES ($1,'CHANGE_USER_STATUS',$2)
    `,
    [adminId, `${userId}:${status}`],
  );

  return rows[0];
}
export async function softDeleteUser(userId, adminId) {
  const { rows } = await pool.query(
    `
    UPDATE users
    SET status = 'inactive', updated_at = NOW()
    WHERE id = $1
    RETURNING id, email, status
    `,
    [userId],
  );

  if (!rows.length) {
    throw Object.assign(new Error("User not found"), { status: 404 });
  }

  await pool.query(
    `
    INSERT INTO audit_logs (user_id, action, target)
    VALUES ($1,'DELETE_USER',$2)
    `,
    [adminId, userId],
  );

  return { message: "User soft-deleted successfully" };
}

export async function restoreUser(userId, adminId) {
  const { rows } = await pool.query(
    `
    SELECT id, status
    FROM users
    WHERE id = $1
    `,
    [userId],
  );
  if (!rows.length) {
    throw Object.assign(new Error("User not found"), { status: 404 });
  }
  await pool.query(
    `
    UPDATE users
    SET status = 'active'
    WHERE id = $1
    `,
    [userId],
  );
  await pool.query(
    `
    INSERT INTO audit_logs (user_id, action, target)
    VALUES ($1, 'RESTORE_USER', $2)
    `,
    [adminId, userId],
  );

  return { message: "User restored successfully" };
}
