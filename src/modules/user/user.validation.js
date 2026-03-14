import Joi from "joi";
import { fileFieldValidation, generalValidationFields } from "../../common/utils/index.js";

export const profileImage = {
  file: generalValidationFields.file(fileFieldValidation.image).required(),
};

export const profileCoverImage = {
  files: Joi.array().items(generalValidationFields.file().required()).min(1).max(5).required(),
};
