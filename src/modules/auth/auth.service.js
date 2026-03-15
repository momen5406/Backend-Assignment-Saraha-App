import {
  BadRequestException,
  compare,
  ConflictException,
  createLoginCredentials,
  generateDecryption,
  NotFoundException,
  sendEmail,
} from "../../common/utils/index.js";
import { otpRepository, userRepository } from "../../db/models/index.js";
import { checkUserExist } from "../user/user.service.js";

export const sendOTP = async (inputs) => {
  const { email } = inputs;

  const otpDoc = await otpRepository.findOne({ email });

  if (otpDoc) throw new BadRequestException("Cannot send OTP, Your OTP is still valid.");

  const otp = Math.floor(100000 + Math.random() * 900000);
  await otpRepository.create({ email, otp, expiresAt: Date.now() + 5 * 60 * 1000 });
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

  const user = await userRepository.create({ username, email, password, phone });
  return user;
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
  const otpDoc = await otpRepository.findOne({ email });

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

  await userRepository.update({ email }, { isEmailVerified: true, confirmEmail: Date.now() });
  await otpRepository.deleteOne({ _id: otpDoc._id });
  return true;
};
