import { ApiError } from "../utils/ApiError.js";

const validateData = (schema) => {
  return (req, _res, next) => {
    const validationResult = schema.safeParse({ ...req.body });

    if (!validationResult.success) {
      return next(
        new ApiError(
          400,
          "Validation failed",
          validationResult.error.issues[0].message,
        ),
      );
    }

    next();
  };
};

export { validateData };
