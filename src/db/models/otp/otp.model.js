import { model, Schema } from "mongoose";

const otpSchema = new Schema({
  email: { type: String, required: true },
  otp: { type: String, required: true },
  expiresAt: { type: Date, index: { expires: 0 } },
  attempts: { type: Number, default: 0 },
});

export const OTP = model("otp", otpSchema);
