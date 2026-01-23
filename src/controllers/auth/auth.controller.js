import {
  activateAccount,
  inviteUser,
  login,
  logout,
} from "../../services/auth/auth.service.js";

export async function loginController(req, res) {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ msg: "Email and Password are required" });
  }
  try {
    const result = await login(email, password);
    return res.status(200).json(result);
  } catch (error) {
    return res.status(error.status || 500).json({
      error: error.message || "Internal server error",
    });
  }
}
export async function inviteController(req, res) {
  const { email, roleId, fullName } = req.body;

  if (!email || !roleId) {
    return res.status(400).json({ message: "Email and roleId are required" });
  }

  try {
    const result = await inviteUser({
      email,
      roleId,
      fullName,
      adminId: req.user.id,
    });

    return res.status(200).json(result);
  } catch (error) {
    return res.status(error.status || 500).json({
      error: error.message || "Invite user failed",
    });
  }
}
export async function activateController(req, res) {
  const { token, password, fullName } = req.body;

  if (!token || !password) {
    return res.status(400).json({ message: "Token and password are required" });
  }

  try {
    const result = await activateAccount(token, password, fullName);
    return res.status(200).json(result);
  } catch (error) {
    return res.status(error.status || 500).json({
      error: error.message || "Activate account failed",
    });
  }
}
export async function logoutController(req, res) {
  const { refreshToken } = req.body;

  if (!refreshToken) {
    return res.status(400).json({ message: "Refresh token is required" });
  }

  try {
    await logout(req.user.id, refreshToken);
    return res.status(200).json({ message: "Logged out" });
  } catch (error) {
    return res.status(error.status || 500).json({
      error: error.message || "Logout failed",
    });
  }
}
