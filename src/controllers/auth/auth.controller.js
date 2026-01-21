import { login } from "../../services/auth/auth.service.js";

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
