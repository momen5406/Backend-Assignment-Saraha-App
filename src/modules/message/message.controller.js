import { Router } from "express";
import { getAllMessages, getSpecificMessage, sendMessage } from "./message.service.js";
import { localFileUpload } from "./../../common/utils/multer/local.multer.js";
import { fileFieldValidation } from "../../common/utils/multer/validation.multer.js";
import { authentication } from "./../../middleware/authentication.middleware.js";

const router = Router();

router.post(
  "/:receiverId/anonymous",
  localFileUpload({ customPath: `messages/attachments`, validation: fileFieldValidation.image }).array(
    "attachments",
    2
  ),
  async (req, res, next) => {
    const { content } = req.body;
    const { receiverId } = req.params;
    const files = req.files;

    const createdMessage = await sendMessage(content, files, receiverId);

    return res.status(201).json({ message: "Message created successfully.", success: true, data: { createdMessage } });
  }
);

router.post(
  "/:receiverId/public",
  authentication(),
  localFileUpload({ customPath: `messages/attachments`, validation: fileFieldValidation.image }).array(
    "attachments",
    2
  ),
  async (req, res, next) => {
    const { content } = req.body;
    const { receiverId } = req.params;
    const files = req.files;

    const createdMessage = await sendMessage(content, files, receiverId, req.user._id);

    return res.status(201).json({ message: "Message created successfully.", success: true, data: { createdMessage } });
  }
);

router.get("/:id", authentication(), async (req, res, next) => {
  const { id } = req.params;

  const message = await getSpecificMessage(id, req.user._id);
  return res.status(201).json({ message: "Done", success: true, data: { message } });
});

router.get("/", authentication(), async (req, res, next) => {
  const messages = await getAllMessages(req.user._id);
  return res.status(201).json({ message: "Done", success: true, data: { messages } });
});

export default router;
