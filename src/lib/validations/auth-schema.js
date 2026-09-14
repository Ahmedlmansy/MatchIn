import { z } from "zod";

export const registerSchema = z
  .object({
    fullName: z.string().min(1, "Full name is required"),
    email: z
      .string()
      .min(1, "Email is required")
      .email("Enter a valid email address"),
    password: z.string().min(8, "Password must be at least 8 characters"),
    confirmPassword: z.string().min(1, "Please confirm your password"),
    terms: z.literal(true, {
      errorMap: () => ({
        message: "You must accept the Terms and Privacy Policy",
      }),
    }),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match — please check and try again.",
    path: ["confirmPassword"],
  });

export const otpSchema = z.object({
  code: z
    .string()
    .length(6, "Enter all 6 digits")
    .regex(/^\d{6}$/, "Code must be numbers only"),
});
