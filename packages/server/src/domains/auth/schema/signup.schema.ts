import { createZodDto } from "nestjs-zod";
import { z } from "zod";

export const signupSchema = z.object({
  email: z.string().email().describe("User's email"),
  firstName: z.string().min(2).describe("User's first name"),
  lastName: z.string().min(2).describe("User's last name"),
  picture: z.string().optional().describe("User's profile picture URL"),
});

export class SignupDto extends createZodDto(signupSchema) {}
