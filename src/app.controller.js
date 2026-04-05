import express from "express";
import cors from "cors";
import { userRouter, authRouter, messageRouter } from "./modules/index.js";
import { connectDB } from "./db/connection.js";
import { port } from "../config/config.service.js";
import { resolve } from "node:path";
import { redisConnect } from "./db/redis.connection.js";
import helmet from "helmet";
import rateLimit from "express-rate-limit";

const bootstrap = async () => {
  const app = express();

  await connectDB();
  redisConnect();

  app.use(cors("*"));
  app.use(express.json());
  app.use("/uploads", express.static(resolve("./uploads")));
  app.use(helmet());

  const limit = rateLimit({
    windowMs: 60 * 1000,
    limit: 2,
    handler: (req, res, next) => {
      throw new Error(this.message, { cause: this.statusCode });
    },
  });
  app.use(limit);

  app.use("/user", userRouter);
  app.use("/auth", authRouter);
  app.use("/message", messageRouter);

  app.use((error, req, res, next) => {
    return res.status(error.cause || 500).json({ message: error.message, success: false, stack: error.stack });
  });

  app.listen(port, () => console.log(`Saraha App listening on port ${port}!`));
};

export default bootstrap;
