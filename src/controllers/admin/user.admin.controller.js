import {
  getAllUsers,
  getUserById,
  updateUser,
  changeUserStatus,
  softDeleteUser,
  restoreUser,
} from "../../services/admin/user.admin.service.js";

export async function getAllUsersController(req, res) {
  try {
    const users = await getAllUsers();
    return res.json(users);
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
}

export async function getUserByIdController(req, res) {
  try {
    const user = await getUserById(req.params.id);
    return res.json(user);
  } catch (err) {
    return res.status(err.status || 500).json({ error: err.message });
  }
}

export async function updateUserController(req, res) {
  try {
    const updated = await updateUser(req.params.id, req.body, req.user.id);
    return res.json(updated);
  } catch (err) {
    return res.status(err.status || 500).json({ error: err.message });
  }
}

export async function changeUserStatusController(req, res) {
  try {
    const result = await changeUserStatus(
      req.params.id,
      req.body.status,
      req.user.id,
    );
    return res.json(result);
  } catch (err) {
    return res.status(err.status || 500).json({ error: err.message });
  }
}

export async function deleteUserController(req, res) {
  try {
    const result = await softDeleteUser(req.params.id, req.user.id);
    return res.json(result);
  } catch (err) {
    return res.status(err.status || 500).json({ error: err.message });
  }
}

export async function restoreUserController(req, res) {
  const { id } = req.params;

  if (!id) {
    return res.status(400).json({ message: "User id is required" });
  }

  try {
    const result = await restoreUser(id, req.user.id);
    return res.status(200).json(result);
  } catch (error) {
    return res.status(error.status || 500).json({
      error: error.message || "Restore user failed",
    });
  }
}
