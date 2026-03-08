import { Router } from "express";
import { login, signup } from "./auth.service.js";
import { generateEncryption, hash } from "../../common/utils/index.js";

const router = Router();

router.post("/signup", async (req, res, next) => {
  // Hashing password before passing to signup
  if (req.body.password) req.body.password = await hash(req.body.password);
  // Encrypting phone before passing to signup
  if (req.body.phone) req.body.phone = await generateEncryption(req.body.phone);

  const account = await signup(req.body);
  return res.status(201).json({ message: "Done signup", account });
});

router.post("/login", async (req, res, next) => {
  const credentials = await login(req.body);
  return res.status(200).json({ message: "Done Login", credentials });
});

export default router;
