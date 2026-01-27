import {
  getMyProfile,
  updateMyProfile,
  changePassword,
  forgotPassword,
  resetPassword,
} from "../../services/profile/profile.service.js";

export async function getProfileController(req, res) {
  try {
    const profile = await getMyProfile(req.user.id);
    return res.status(200).json(profile);
  } catch (error) {
    return res.status(error.status || 500).json({
      error: error.message || "Get profile failed",
    });
  }
}
export async function updateProfileController(req, res) {
  try {
    const result = await updateMyProfile(req.user.id, req.body);
    return res.status(200).json(result);
  } catch (error) {
    return res.status(error.status || 500).json({
      error: error.message || "Update profile failed",
    });
  }
}
export async function changePasswordController(req, res) {
  const { oldPassword, newPassword } = req.body;

  if (!oldPassword || !newPassword) {
    return res.status(400).json({
      message: "Old password and new password are required",
    });
  }

  try {
    const result = await changePassword(req.user.id, oldPassword, newPassword);
    return res.status(200).json(result);
  } catch (error) {
    return res.status(error.status || 500).json({
      error: error.message || "Change password failed",
    });
  }
}
export async function forgotPasswordController(req, res) {
  const { email } = req.body;

  if (!email) {
    return res.status(400).json({ message: "Email is required" });
  }

  try {
    await forgotPassword(email);
    return res.status(200).json({
      message: "If the email exists, a reset link has been sent",
    });
  } catch (error) {
    return res.status(error.status || 500).json({
      error: error.message || "Forgot password failed",
    });
  }
}
export async function resetPasswordController(req, res) {
  const { token, newPassword } = req.body;

  if (!token || !newPassword) {
    return res.status(400).json({
      message: "Token and new password are required",
    });
  }

  try {
    const result = await resetPassword(token, newPassword);
    return res.status(200).json(result);
  } catch (error) {
    return res.status(error.status || 500).json({
      error: error.message || "Reset password failed",
    });
  }
}
