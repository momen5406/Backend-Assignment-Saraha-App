import { Router } from "express";
import { getUserProfile, rotateToken } from "./user.service.js";
import { authentication, authorization } from "../../middleware/authentication.middleware.js";
import { tokenType } from "../../common/constant/tokenType.constant.js";
import { SYS_ROLE } from "../../common/constant/role.constant.js";

const router = Router();

router.get("/", authentication(), authorization([SYS_ROLE.Admin, SYS_ROLE.User]), async (req, res, next) => {
  const account = await getUserProfile(req.user);

  return res.status(200).json({ message: "Profile", account });
});

router.get("/rotate-token", authentication(tokenType.Refresh), async (req, res, next) => {
  const credentials = await rotateToken(req.user);
  return res.status(200).json({ message: "Credentials", credentials });
});

export default router;
