import {
  compare,
  ConflictException,
  createLoginCredentials,
  generateDecryption,
  NotFoundException,
} from "../../common/utils/index.js";
import { userRepository } from "../../db/models/index.js";
import { checkUserExist } from "../user/user.service.js";

export const signup = async (inputs) => {
  const { username, email, password, phone } = inputs;

  const isUserExist = await checkUserExist({ email });
  if (isUserExist) {
    throw new ConflictException("Email already Exist!");
  }

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
