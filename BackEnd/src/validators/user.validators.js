import { z } from "zod";

const registerUserSchema = z
  .object({
    username: z
      .string({
        required_error: "Name is required",
        invalid_type_error: "Name must be a string",
      })
      .min(2, { message: "username must be atleast 2 characters" })
      .max(30, { message: "username cannot exceed 30 characters" })
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
  })
  .strict();

const loginUserSchema = z
  .object({
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
  })
  .strict();

const EmailSchema = z
  .object({
    email: z
      .string({
        required_error: "Email is required",
      })
      .email({ message: "Invalid email address" })
      .trim()
      .toLowerCase(),
  })
  .strict();

const passwordSchema = z
  .object({
    password: z
      .string({
        required_error: "Password is required",
      })
      .min(6, { message: "Password must be atleast 6 characters" })
      .max(30, { message: "Password cannot exceed 30 characters" }),
  })
  .strict();

const passwordChangeSchema = z
  .object({
    currentPassword: z.string({
      required_error: "Current Password is required",
    }),
    newPassword: z
      .string({
        required_error: "New Password is required",
      })
      .min(6, { message: "Password must be atleast 6 characters" })
      .max(30, { message: "Password cannot exceed 30 characters" }),
    confirmPassword: z.string({
      required_error: "Confirm Password is required",
    }),
  })
  .strict();

const updateProfileSchema = z
  .object({
    fullName: z.string().min(2).max(100).optional(),
    bio: z.string().max(500).optional(),
    avatar: z.string().url("Avatar must be a valid URL").optional(),
    country: z.string().max(50).optional(),
    githubURL: z.string().url().optional().or(z.literal("")),
    linkedinURL: z.string().url().optional().or(z.literal("")),
    websiteURL: z.string().url().optional().or(z.literal("")),
  })
  .refine((data) => Object.keys(data).length > 0, {
    message: "At least one field must be provided for update.",
  });

export {
  registerUserSchema,
  loginUserSchema,
  EmailSchema,
  passwordChangeSchema,
  passwordSchema,
  updateProfileSchema,
};
