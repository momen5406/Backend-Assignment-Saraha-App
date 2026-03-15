import mongoose from "mongoose";
import { User } from "./models/index.js";

export const connectDB = async () => {
  try {
    mongoose.connect("mongodb://127.0.0.1:27017/saraha-app");
    console.log("Database connected successfully.");
    await User.syncIndexes();
  } catch (error) {
    console.log("Failed to connect to database.");
  }
};
