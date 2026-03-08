import crypto from "node:crypto";

const IV_LENGTH = 16;
const ENC_SECRET_KEY = Buffer.from("d34e19364034ec67fe3f961d499ae434");

export const generateEncryption = async (plainText) => {
  const iv = crypto.randomBytes(IV_LENGTH);
  const cipherIV = crypto.createCipheriv("aes-256-cbc", ENC_SECRET_KEY, iv);
  let cipherText = cipherIV.update(plainText, "utf-8", "hex");
  cipherText += cipherIV.final("hex");
  return `${iv.toString("hex")}:${cipherText}`;
};

export const generateDecryption = async (cipherText) => {
  const [iv, cipherValue] = cipherText.split(":") || [];
  const ivLikeBinary = Buffer.from(iv, "hex");
  let decipher = crypto.createDecipheriv("aes-256-cbc", ENC_SECRET_KEY, ivLikeBinary);
  let plainText = decipher.update(cipherValue, "hex", "utf-8");
  plainText += decipher.final("utf-8");
  return plainText;
};
