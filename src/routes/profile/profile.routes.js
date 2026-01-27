import express from "express";
import {
  getProfileController,
  updateProfileController,
  changePasswordController,
  forgotPasswordController,
  resetPasswordController,
} from "../../controllers/profile/profile.controller.js";
import { authenticate } from "../../middleware/authMiddlewares.js";

const router = express.Router();

router.get("/me", authenticate, getProfileController);
router.put("/me", authenticate, updateProfileController);
router.put("/change-password", authenticate, changePasswordController);
router.post("/forgot-password", forgotPasswordController);
router.post("/reset-password", resetPasswordController);

export default router;
