import jwt from "jsonwebtoken";
import { userRepository } from "../../db/models/index.js";
import { SYS_ROLE, tokenType } from "./../constant/index.js";
import { BadRequestException, ConflictException, NotFoundException } from "./error.utils.js";
import {
  ACCESS_TOKEN_EXPIRES_IN,
  REFRESH_TOKEN_EXPIRES_IN,
  SYSTEM_ACCESS_TOKEN_SECRET_KEY,
  SYSTEM_REFRESH_TOKEN_SECRET_KEY,
  USER_ACCESS_TOKEN_SECRET_KEY,
  USER_REFRESH_TOKEN_SECRET_KEY,
} from "../../../config/config.service.js";

export const generateToken = async (payload, secretKey, options = {}) => {
  return jwt.sign(payload, secretKey, options);
};

export const verifyToken = async (token, secretKey) => {
  return jwt.verify(token, secretKey);
};

export const detectSignaturesLevel = async (role) => {
  let signatures = { accessSignature: undefined, refreshSignature: undefined };
  switch (role) {
    case SYS_ROLE.Admin:
      signatures = {
        accessSignature: SYSTEM_ACCESS_TOKEN_SECRET_KEY,
        refreshSignature: SYSTEM_REFRESH_TOKEN_SECRET_KEY,
      };
      break;

    default:
      signatures = {
        accessSignature: USER_ACCESS_TOKEN_SECRET_KEY,
        refreshSignature: USER_REFRESH_TOKEN_SECRET_KEY,
      };
      break;
  }
  return signatures;
};

export const getTokenSignature = async (token = tokenType.Access, level) => {
  const { accessSignature, refreshSignature } = await detectSignaturesLevel(level);
  let signature = undefined;
  switch (token) {
    case tokenType.Refresh:
      signature = refreshSignature;
      break;

    default:
      signature = accessSignature;
      break;
  }
  return signature;
};

export const decodeToken = async (token, tokenT = tokenType.Access) => {
  const decoded = jwt.decode(token);

  if (!decoded?.aud?.length) throw new BadRequestException("Missing token audience");

  const [tokenApproach, level] = decoded.aud || [];

  if (tokenT !== tokenApproach) {
    throw new ConflictException(
      `Unexpected token mechanism, we expected ${tokenT}, while you have used ${tokenApproach}`
    );
  }

  const secret = await getTokenSignature(tokenApproach, level);

  const verifiedToken = jwt.verify(token, secret);

  const user = await userRepository.findOne({ _id: verifiedToken.sub });
  if (!user) throw new NotFoundException("Not Registered Account.");

  return user;
};

export const createLoginCredentials = async (user) => {
  const { accessSignature, refreshSignature } = await detectSignaturesLevel(user.role);

  const accessToken = await generateToken({ sub: user._id }, accessSignature, {
    audience: [tokenType.Access, user.role],
    expiresIn: parseInt(ACCESS_TOKEN_EXPIRES_IN),
  });

  const refreshToken = await generateToken({ sub: user._id }, refreshSignature, {
    audience: [tokenType.Refresh, user.role],
    expiresIn: parseInt(REFRESH_TOKEN_EXPIRES_IN),
  });

  return { accessToken, refreshToken };
};
