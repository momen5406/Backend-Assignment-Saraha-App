import { tokenType } from "../../common/constant/tokenType.constant.js";
import { createLoginCredentials, decodeToken } from "../../common/utils/token.utils.js";
import { userRepository } from "../../db/models/index.js";

export const checkUserExist = async (filter) => {
  return await userRepository.findOne(filter);
};

export const getUserProfile = async (user) => {
  return user;
};

export const rotateToken = async (user) => {
  return createLoginCredentials(user);
};
