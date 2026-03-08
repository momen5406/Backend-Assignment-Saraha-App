import pkg from "bcrypt";

export const hash = async (plainText) => {
  return await pkg.hash(plainText, 10);
};

export const compare = async (plainText, hashedText) => {
  return await pkg.compare(plainText, hashedText);
};
