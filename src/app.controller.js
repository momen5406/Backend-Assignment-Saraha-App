import express from "express";
import { userRouter, authRouter } from "./modules/index.js";
import { connectDB } from "./db/connection.js";
import { port } from "../config/config.service.js";
import { resolve } from "node:path";

const bootstrap = async () => {
  const app = express();

  await connectDB();

  app.use(express.json());
  app.use("/uploads", express.static(resolve("./uploads")));

  app.use("/user", userRouter);
  app.use("/auth", authRouter);

  app.use((error, req, res, next) => {
    return res.status(error.cause || 500).json({ message: error.message, success: false, stack: error.stack });
  });

  app.listen(port, () => console.log(`Saraha App listening on port ${port}!`));
};

export default bootstrap;
