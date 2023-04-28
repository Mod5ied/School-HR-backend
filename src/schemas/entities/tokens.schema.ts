import { createZodDto } from 'nestjs-zod';
import { z } from 'nestjs-zod/z';

export const TokenSchema = z.object({
  ok: z.boolean().default(true),
  token: z.string(),
  verified: z.boolean(),
  role: z.string(),
  permissions: z.object({
    read: z.boolean(),
    write: z.boolean(),
  }),
});
export class TokensDto extends createZodDto(TokenSchema) {}

