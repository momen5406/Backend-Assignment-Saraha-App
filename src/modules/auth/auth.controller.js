import { Router } from "express";
import { googleLogin, login, sendOTP, signup, verifyAccount } from "./auth.service.js";
import { generateEncryption, hash } from "../../common/utils/index.js";
import * as validators from "./auth.validation.js";
import { validation } from "../../middleware/validation.middleware.js";

const router = Router();

router.post("/signup", validation(validators.signup), async (req, res, next) => {
  // Hashing password before passing to signup
  if (req.body.password) req.body.password = await hash(req.body.password);
  // Encrypting phone before passing to signup
  if (req.body.phone) req.body.phone = await generateEncryption(req.body.phone);

  const account = await signup(req.body);
  return res.status(201).json({ message: "Done signup", account });
});

router.post("/login", validation(validators.login), async (req, res, next) => {
  const credentials = await login(req.body);
  return res.status(200).json({ message: "Done Login", credentials });
});

router.patch("/verify-account", async (req, res, next) => {
  await verifyAccount(req.body);
  return res.status(200).json({ message: "Email verified Successfully.", success: "done" });
});

router.post("/resend-otp", async (req, res, next) => {
  await sendOTP(req.body);
  return res.status(200).json({ message: "OTP sent Successfully.", success: "done" });
});

router.post("/login-with-google", async (req, res, next) => {
  const { idToken } = req.body;

  const credentials = await googleLogin();
  return res.status(200).json({ message: "Login Successfully", success: "done", data: credentials });
});

export default router;
