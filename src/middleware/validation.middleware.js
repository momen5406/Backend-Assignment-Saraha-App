export const validation = (schema) => {
  return (req, res, next) => {
    const errors = [];

    for (const key of Object.keys(schema) || []) {
      const validationResult = schema[key].validate(req[key], { abortEarly: false });
      if (validationResult.error) {
        errors.push({
          key,
          details: validationResult.error.details.map((ele) => {
            return { path: ele.path, message: ele.message };
          }),
        });
      }
    }
    if (errors.length) {
      return res.status(400).json({ message: "Validation error", extra: errors });
    }
    next();
  };
};
