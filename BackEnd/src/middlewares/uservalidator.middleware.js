import { apiError } from "../utils/ApiError.js";
import {
  loginUserSchema,
  passwordChangeSchema,
  registerUserSchema,
  EmailSchema,
} from "../validators/user.validators.js";

const validateRegisterUser = (req, _res, next) => {
  const validationResult = registerUserSchema.safeParse({ ...req.body });

  if (!validationResult.success) {
    return next(
      apiError(
        400,
        "Validation failed",
        validationResult.error.issues[0].message,
      ),
    );
  }

  next();
};

const validateLoginUser = (req, _res, next) => {
  const validationResult = loginUserSchema.safeParse({ ...req.body });

  if (!validationResult.success) {
    return next(
      apiError(
        400,
        "Validation failed",
        validationResult.error.issues[0].message,
      ),
    );
  }

  next();
};

const validateEmail = (req, _res, next) => {
  const validationResult = EmailSchema.safeParse({ ...req.body });

  if (!validationResult.success) {
    return next(
      apiError(
        400,
        "Validation failed",
        validationResult.error.issues[0].message,
      ),
    );
  }

  next();
};

const validatePassword = (req, _res, next) => {
  const validationResult = passwordChangeSchema.safeParse({ ...req.body });

  if (!validationResult.success) {
    return next(
      apiError(
        400,
        "Validation failed",
        validationResult.error.issues[0].message,
      ),
    );
  }

  next();
};

export {
  validateRegisterUser,
  validateLoginUser,
  validateEmail,
  validatePassword,
};
