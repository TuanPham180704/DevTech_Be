import express from "express";
import {
  getAllUsersController,
  getUserByIdController,
  updateUserController,
  changeUserStatusController,
  deleteUserController,
  restoreUserController,
} from "../../controllers/admin/user.admin.controller.js";

import {
  authenticate,
  authorization,
} from "../../middleware/authMiddlewares.js";

const router = express.Router();

router.use(authenticate, authorization([1]));

router.get("/", getAllUsersController);
router.get("/:id", getUserByIdController);
router.put("/:id", updateUserController);
router.patch("/:id/restore", authenticate, restoreUserController);
router.patch("/:id/status", changeUserStatusController);
router.delete("/:id", deleteUserController);

export default router;
