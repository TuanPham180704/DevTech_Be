import express from "express";
import {
  loginController,
  logoutController,
  inviteController,
  activateController,
} from "../../controllers/auth/auth.controller.js";
import {
  authenticate,
  authorization,
} from "../../middleware/authMiddlewares.js";
const router = express.Router();

router.post("/login", loginController);
router.post("/activate", activateController);
router.post("/invite", authenticate, authorization([1]), inviteController);
router.post("/logout", authenticate, logoutController);
export default router;
