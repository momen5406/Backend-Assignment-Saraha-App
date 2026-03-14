import Joi from "joi";

export const generalValidationFields = {
  email: Joi.string().email({ minDomainSegments: 2, maxDomainSegments: 3, tlds: { allow: ["com", "net"] } }),
  password: Joi.string().pattern(new RegExp(/(?=.*[a-z])(?=.*[A-Z])(?=.*\W).{8,16}$/)),
  username: Joi.string(),
  phone: Joi.string().pattern(new RegExp(/^(00201|\+201|01)(0|1|2|5)\d{8}$/)),
  confirmPassword: function (path = "password") {
    return Joi.string().valid(Joi.ref(path));
  },
  file: function (validation = []) {
    return Joi.object().keys({
      fieldname: Joi.string().required(),
      originalname: Joi.string().required(),
      encoding: Joi.string().required(),
      mimetype: Joi.string()
        .valid(...Object.values(validation))
        .required(),
      finalPath: Joi.string().required(),
      destination: Joi.string().required(),
      filename: Joi.string().required(),
      path: Joi.string().required(),
      size: Joi.number().required(),
    });
  },
};
