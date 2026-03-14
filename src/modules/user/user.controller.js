import { Router } from "express";
import { getUserProfile, logout, profileCoverImage, profileImage, rotateToken } from "./user.service.js";
import { authentication, authorization } from "../../middleware/authentication.middleware.js";
import { tokenType } from "../../common/constant/tokenType.constant.js";
import { SYS_ROLE } from "../../common/constant/role.constant.js";
import { fileFieldValidation, localFileUpload } from "../../common/utils/index.js";
import { validation } from "./../../middleware/validation.middleware.js";
import * as validators from "./user.validation.js";

const router = Router();

router.post("/logout", authentication(), async (req, res, next) => {
  const status = await logout(req.body, req.user, req.decoded);
  return res.status(status).json({ message: "logout" });
});

router.patch(
  "/profile-image",
  authentication(),
  localFileUpload({ customPath: "users/profile", validation: fileFieldValidation.image }).single("attachment"),
  validation(validators.profileImage),
  async (req, res, next) => {
    const account = await profileImage(req.file, req.user);

    return res.status(200).json({ message: "Profile", account });
  }
);

router.patch(
  "/profile-cover-image",
  authentication(),
  localFileUpload({ customPath: "users/profile/cover", validation: fileFieldValidation.image }).array("attachments", 2),
  validation(validators.profileCoverImage),
  async (req, res, next) => {
    const account = await profileCoverImage(req.files, req.user);

    return res.status(200).json({ message: "Profile", account });
  }
);

router.get("/", authentication(), authorization([SYS_ROLE.Admin, SYS_ROLE.User]), async (req, res, next) => {
  const account = await getUserProfile(req.user);

  return res.status(200).json({ message: "Profile", account });
});

router.post("/rotate-token", authentication(tokenType.Refresh), async (req, res, next) => {
  const credentials = await rotateToken(req.user, req.decoded);
  return res.status(201).json({ message: "Credentials", credentials });
});

export default router;
