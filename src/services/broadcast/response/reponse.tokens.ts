import { TokensDto, TokenSchema } from 'src/schemas/entities/tokens.schema';
import { EmailOptions } from '../mailer/mailer.types';
import { Injectable, Logger } from '@nestjs/common';
import { ModuleRef } from '@nestjs/core';

@Injectable()
export class ResponseService {
  constructor(private moduleRef: ModuleRef) { }

  private readonly logger = new Logger(ResponseService.name);

  private validateResponse(res: any): TokensDto {
    const validateResult = TokenSchema.safeParse(res);

    if (validateResult.success) return validateResult.data;
    this.logger.error(`Zod validation failed: ${validateResult}`);
    return;
  }

  /** Response method sends the login link with token to users via email.  */
  public async respondToEmail(response: any, options: EmailOptions) {
    const { TokensLogger } = await import('../logger/logger.tokens.js');
    const loggerT = await this.moduleRef.resolve(TokensLogger);
    try {
      return loggerT.logResponseToMail(response, options);
    } catch (e) {
      return loggerT.logError(e);
    }
  }

  /** Response method confirms tokens validity to client. */
  public async respondToClient(token: string, { role, permissions }, info = "") {
    const res = {
      info,
      permissions,
      role,
      token,
      verified: true,
    };
    return this.validateResponse(res);
  }
}
