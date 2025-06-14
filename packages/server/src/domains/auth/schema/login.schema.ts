import { createZodDto } from "nestjs-zod";
import { z } from "zod";

export const credentialSchema = z.object({
  email: z.string().email().describe("User's email"),
});

export class CredentialDto extends createZodDto(credentialSchema) {}

export const otpSchema = z.object({
  email: z.string().email().describe("User's email"),
  otp: z.string().describe("User's OTP"),
  firstName: z.string().optional().describe("User's first name"),
});

export class OtpDto extends createZodDto(otpSchema) {}
