import { OAuth2Client } from "google-auth-library";
import {
  BadRequestException,
  compare,
  ConflictException,
  createLoginCredentials,
  generateDecryption,
  generateToken,
  NotFoundException,
  sendEmail,
} from "../../common/utils/index.js";
import { otpRepository, userRepository } from "../../db/models/index.js";
import { checkUserExist } from "../user/user.service.js";
import { SYS_PROVIDER } from "../../common/constant/provider.constant.js";
import { redisClient } from "../../db/redis.connection.js";

export const sendOTP = async (inputs) => {
  const { email } = inputs;

  // const otpDoc = await otpRepository.findOne({ email });
  const otpDoc = await redisClient.exists(`${email}:otp`);

  if (otpDoc) throw new BadRequestException("Cannot send OTP, Your OTP is still valid.");

  const otp = Math.floor(100000 + Math.random() * 900000);
  // await otpRepository.create({ email, otp, expiresAt: Date.now() + 5 * 60 * 1000 });
  redisClient.set(`${email}:otp`, otp, { expiration: 1 * 60 * 60 });
  await sendEmail({ to: email, subject: "Verify your account", html: `<p>OTP to verify account: ${otp}</p>` });
};

export const signup = async (inputs) => {
  const { username, email, password, phone } = inputs;

  const isUserExist = await checkUserExist({ email });
  if (isUserExist) {
    throw new ConflictException("Email already Exist!");
  }

  // OTP
  await sendOTP({ email });

  // const user = await userRepository.create({ username, email, password, phone });
  // return user;

  await redisClient.set(email, JSON.stringify(inputs), { expiration: 2 * 24 * 60 * 60 });
};

export const login = async (inputs) => {
  const { email, password } = inputs;

  const user = await checkUserExist({ email });
  const passwordMatched = await compare(
    password,
    user?.password || "$2b$10$XseugRtozwZ0J.M99QacwZFmrbyJxwpOstmP40hf6fPme"
  );

  if (!user || !passwordMatched) {
    throw new NotFoundException("Invalid credentials!");
  }

  return createLoginCredentials(user);
};

export const verifyAccount = async (inputs) => {
  const { email, otp } = inputs;
  // const otpDoc = await otpRepository.findOne({ email });
  const otpDoc = await redisClient.get(`${email}:otp`);

  if (!otpDoc) throw new BadRequestException("OTP expired!");

  if (otpDoc.otp != otp) {
    otpDoc.attempts += 1;

    if (otpDoc.attempts > 3) {
      otpRepository.deleteOne({ _id: otpDoc._id });
      throw new BadRequestException("Too many tries!");
    }

    await otpDoc.save();
    throw new BadRequestException("Invalid OTP!");
  }

  let data = await redisClient.get(email);
  data = JSON.parse(data);
  await userRepository.update(data);
  await redisClient.del(email);
  await redisClient.del(`${email}:otp`);
  await otpRepository.deleteOne({ _id: otpDoc._id });
  return true;
};

async function googleVerifyToken(idToken) {
  const client = new OAuth2Client("170228716976-s8tq98ac6q3qjikk86cc5mvf9o1qk2r2.apps.googleusercontent.com");
  const ticket = await client.verifyIdToken({ idToken });
  return ticket.getPayload();
}

export const googleLogin = async (idToken) => {
  const payload = await googleVerifyToken(idToken);

  if (payload.email_verified == false) throw new BadRequestException("Refused email from google");

  const user = await userRepository.findOne({ email: payload.email });
  if (!user) {
    const createdUser = await userRepository.create({
      email: payload.email,
      profilePic: payload.picture,
      username: payload.name,
      isEmailVerified: true,
      provider: SYS_PROVIDER.google,
    });

    return generateToken({ sub: createdUser._id, role: createdUser.role, provider: createdUser.provider });
  }

  return generateToken({ sub: user._id, role: user.role, provider: user.provider });
};
