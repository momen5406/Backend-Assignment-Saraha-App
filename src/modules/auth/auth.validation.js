import Joi from "joi";
import { generalValidationFields } from "../../common/utils/index.js";

export const login = {
  body: Joi.object()
    .keys({
      email: generalValidationFields.email.required(),
      password: generalValidationFields.password.required(),
    })
    .required(),
};

export const signup = {
  body: login.body
    .append()
    .keys({
      username: generalValidationFields.username.required(),
      phone: generalValidationFields.phone.required(),
      confirmPassword: generalValidationFields.confirmPassword("password").required(),
    })
    .required(),
  query: Joi.object()
    .keys({
      lang: Joi.string().valid("ar", "en").required(),
    })
    .required(),
};
