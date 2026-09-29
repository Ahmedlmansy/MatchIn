import { z } from "zod";

export const registerSchema = z
  .object({
    name: z
      .string()
      .min(1, "Full name is required")
      .min(3, "Full name must be at least 3 characters"),
    email: z
      .string()
      .min(1, "Email is required")
      .email("Enter a valid email address"),
    password: z
      .string()
      .min(8, "Password must be at least 8 characters")
      .regex(/[A-Z]/, {
        message: "Password must contain at least one uppercase letter",
      })
      .regex(/[a-z]/, {
        message: "Password must contain at least one lowercase letter",
      })
      .regex(/[0-9]/, { message: "Password must contain at least one number" })
      .regex(/[^A-Za-z0-9]/, {
        message: "Password must contain at least one special character",
      }),
    password_confirmation: z.string().min(1, "Please confirm your password"),
    terms: z.literal(true, {
      message: "You must accept the Terms and Privacy Policy",
    }),
  })
  .refine((data) => data.password === data.password_confirmation, {
    message: "Passwords don't match — please check and try again.",
    path: ["password_confirmation"],
  });

export const otpSchema = z.object({
  code: z
    .string()
    .length(6, "Enter all 6 digits")
    .regex(/^\d{6}$/, "Code must be numbers only"),
});
