import { z } from "zod";

export const registerSchema = z.object({
  fullName: z
    .string()
    .min(1, "الاسم مطلوب")
    .min(3, "الاسم لازم يكون 3 أحرف على الأقل"),
  email: z
    .string()
    .min(1, "الإيميل مطلوب")
    .email("صيغة الإيميل مش صحيحة"),
  phone: z
    .string()
    .min(1, "رقم الموبايل مطلوب")
    .regex(/^01[0125][0-9]{8}$/, "رقم موبايل مصري غير صحيح"),
  password: z
    .string()
    .min(8, "الباسورد لازم يكون 8 أحرف على الأقل")
    .regex(/[A-Z]/, "لازم يحتوي على حرف كابيتال")
    .regex(/[0-9]/, "لازم يحتوي على رقم"),
});

export const otpSchema = z.object({
  code: z
    .string()
    .length(6, "الكود لازم يكون 6 أرقام")
    .regex(/^\d{6}$/, "الكود أرقام بس"),
});
