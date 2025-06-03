import { z } from "zod";

export const credentialSchema = z
  .object({
    email: z.string().email(),
    password: z.string(),
  })
  .required();

export type CredentialDto = z.infer<typeof credentialSchema>;
