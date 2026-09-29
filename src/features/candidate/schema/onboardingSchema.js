import { z } from "zod";
import { validationMessage } from "@/features/auth/schema/validation-message";

export const requiredFieldSchema = z
  .string()
  .trim()
  .min(1, { error: validationMessage("required") });
