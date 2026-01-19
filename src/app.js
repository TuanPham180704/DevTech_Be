import express from "express";
import cors from "cors";
import morgan from "morgan";
import dotenv from "dotenv";
dotenv.config();
import errorHandler from "./middleware/errorHandler";
const app = express();
app.use(cors());
app.use(morgan("dev"));

app.get("/", (req, res) => {
  res.send("DevTech");
});

app.use(errorHandler);
export default app;
