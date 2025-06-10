import { createZodDto } from "nestjs-zod";
import { z } from "zod";

export const credentialSchema = z.object({
  email: z.string().email().describe("User's email"),
});

export class CredentialDto extends createZodDto(credentialSchema) {}
