import { z } from "zod"
import { validationMessage } from "./validation-message";

export const loginSchema = z.object({
    email: z.string()
      .min(1, { error: validationMessage("required") })
      .email({ error: validationMessage("emailInvalid") }),
    password: z.string().min(8, { error: validationMessage("passwordMin", { count: 8 }) }),
})