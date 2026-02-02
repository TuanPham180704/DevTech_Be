import express from "express";
import cors from "cors";
import morgan from "morgan";
import dotenv from "dotenv";
dotenv.config();
import errorHandler from "./middleware/errorHandler.js";
import authRoutes from "./routes/auth/auth.routes.js";
import profileRoutes from "./routes/profile/profile.routes.js";

import adminUserRoutes from "./routes/admin/user.routes.js";

const app = express();
app.use(cors());
app.use(morgan("dev"));
app.use(express.json());
app.get("/", (req, res) => {
  res.send("DevTech");
});

app.use("/api/auth", authRoutes);
app.use("/api/profile", profileRoutes);
app.use("/api/admin/users", adminUserRoutes);
app.use(errorHandler);
export default app;
