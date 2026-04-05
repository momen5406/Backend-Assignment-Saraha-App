import { NotFoundException } from "../../common/utils/error.utils.js";
import { messageRepository } from "../../db/models/message/message.repository.js";

export const sendMessage = async (content, files, receiverId, senderId = undefined) => {
  let paths = [];
  if (files) {
    paths = files.map((file) => {
      return file.path;
    });
  }
  const createdMessage = await messageRepository.create({
    content,
    attachments: paths,
    receiver: receiverId,
    sender: senderId,
  });
  return createdMessage;
};

export const getSpecificMessage = async (id, userId) => {
  const message = await messageRepository.findOne(
    { _id: id, $or: [{ receiver: userId }, { sender: userId }] },
    {},
    {
      populate: [
        { path: "receiver", select: "username email" },
        { path: "sender", select: "username email" },
      ],
    }
  );
  if (!message) throw new NotFoundException("Message not found.");
  return message;
};

export const getAllMessages = async (userId) => {
  const messages = await messageRepository.getAll(
    { $or: [{ receiver: userId }, { sender: userId }] },
    {},
    {
      populate: [
        { path: "receiver", select: "username email" },
        { path: "sender", select: "username email" },
      ],
    }
  );
  if (messages.length == 0) throw new NotFoundException("Message not found.");
  return messages;
};
