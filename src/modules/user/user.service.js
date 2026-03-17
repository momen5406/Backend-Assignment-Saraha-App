import { LOGOUT } from "../../common/constant/index.js";
import { ConflictException } from "../../common/utils/error.utils.js";
import { createLoginCredentials, decodeToken } from "../../common/utils/token.utils.js";
import { userRepository, tokenRepository } from "../../db/models/index.js";
import { redisClient } from "../../db/redis.connection.js";
import { ACCESS_TOKEN_EXPIRES_IN, REFRESH_TOKEN_EXPIRES_IN } from "./../../../config/config.service.js";

export const checkUserExist = async (filter) => {
  return await userRepository.findOne(filter);
};

export const logout = async ({ flag }, user, { jti, iat }) => {
  let status = 200;
  switch (flag) {
    case LOGOUT.All:
      user.changeCredentials = new Date();
      await user.save();

      await tokenRepository.deleteMany({ userId: user._id });
      break;

    default:
      await tokenRepository.create({
        userId: user._id,
        jti,
        expiresIn: new Date((iat + parseInt(REFRESH_TOKEN_EXPIRES_IN)) * 1000),
      });
      status = 201;
      break;
  }

  return status;
};

export const profileImage = async (file, user) => {
  user.profilePic = file.finalPath.replace(/\\/g, "/");
  await user.save();
  return user;
};

export const profileCoverImage = async (files, user) => {
  user.coverProfilePic = files.map((file) => file.finalPath);
  await user.save();
  return user;
};

export const getUserProfile = async (user) => {
  return user;
};

export const rotateToken = async (user, { jti, iat }) => {
  if ((iat + parseInt(ACCESS_TOKEN_EXPIRES_IN)) * 1000 >= Date.now() + 30000) {
    throw new ConflictException("Current access token is still valid.");
  }

  await tokenRepository.create({
    userId: user._id,
    jti,
    expiresIn: new Date((iat + parseInt(REFRESH_TOKEN_EXPIRES_IN)) * 1000),
  });
  return createLoginCredentials(user);
};
