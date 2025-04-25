import { z } from "zod";

const registerUserSchema = z.object({
  name: z
    .string({
      required_error: "Name is required",
      invalid_type_error: "Name must be a string",
    })
    .min(2, { message: "Name must be atleast 2 characters" })
    .max(30, { message: "Name cannot exceed 30 characters" })
    .trim()
    .toLowerCase(),
  email: z
    .string({
      required_error: "Email is required",
    })
    .email({ message: "Invalid email address" })
    .trim()
    .toLowerCase(),
  password: z
    .string({
      required_error: "Password is required",
    })
    .min(6, { message: "Password must be atleast 6 characters" })
    .max(30, { message: "Password cannot exceed 30 characters" }),
});

const loginUserSchema = z.object({
  email: z
    .string({
      required_error: "Email is required",
    })
    .email({ message: "Invalid email address" })
    .trim()
    .toLowerCase(),
  password: z.string({
    required_error: "Password is required",
  }),
});

const EmailSchema = z.object({
  email: z
    .string({
      required_error: "Email is required",
    })
    .email({ message: "Invalid email address" })
    .trim()
    .toLowerCase(),
});

const passwordSchema = z.object({
  password: z
    .string({
      required_error: "Password is required",
    })
    .min(6, { message: "Password must be atleast 6 characters" })
    .max(30, { message: "Password cannot exceed 30 characters" }),
});

const passwordChangeSchema = z.object({
  currentPassword: z.string({
    required_error: "Current Password is required",
  }),
  newPassword: z
    .string({
      required_error: "Password is required",
    })
    .min(6, { message: "Password must be atleast 6 characters" })
    .max(30, { message: "Password cannot exceed 30 characters" }),
  confirmPassword: z.string({
    required_error: "Current Password is required",
  }),
});

export {
  registerUserSchema,
  loginUserSchema,
  EmailSchema,
  passwordChangeSchema,
  passwordSchema,
};
