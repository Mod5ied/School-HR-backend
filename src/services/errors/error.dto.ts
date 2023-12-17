import { createZodDto } from 'nestjs-zod';
import { z } from 'nestjs-zod/z';

export const ErrorSchema = z.object({
  ok: z.boolean(),
  code: z.number().max(3, 'Invalid Error-code'),
  error: z.string({ required_error: 'err-message is required' }),
  metadata: z.optional(
    z.object({
      messages: z.string({ required_error: 'err-message is required' }),
    }),
  ),
});
export class ErrorDto extends createZodDto(ErrorSchema) {}
