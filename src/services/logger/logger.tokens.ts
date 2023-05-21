import { WINSTON_MODULE_PROVIDER } from 'nest-winston';
import { EmailTransport } from '../broadcast/mailer/mailer.transport';
import { EmailOptions } from '../broadcast/mailer/mailer.types';
import { Injectable, Inject } from '@nestjs/common';
import { Logger, } from 'winston';

@Injectable()
export class TokensLogger {
  constructor(
    // private readonly logger = new Logger(TokensLogger.name),
    @Inject(WINSTON_MODULE_PROVIDER) private readonly logger: Logger,
    private readonly emailTransport: EmailTransport,
  ) { }

  /** Method used to send emails with tokens to users.  */
  public async logResponseToMail(resp: string, emailOptions: EmailOptions) {
    try {
      this.logger.info(resp)
      return await this.emailTransport.sendEmail(emailOptions);
    } catch (error) {
      return this.logger.error(`[Token_Logging] - ${(error)}`);
    }
  }

  /** Deprecated. Use the logger instance directly in your service. */
  public logResponse(resp: any) {
    return this.logger.info(resp)
  }

  /** Deprecated. Use the logger instance directly in your service. */
  public logError(err: string) {
    return this.logger.error(`[Token_Logging] - ${(err)}`);
  }

  /** Method logs and sends App level critical error to Developers for diagnosis */
  public async logErrorToMail(err: string, emailOptions: EmailOptions) {
    try {
      this.logger.error((err));
      return await this.emailTransport.sendEmail(emailOptions);
    } catch (error) {
      return this.logger.error(`[Token_Logging] - ${(error)})}`);
    }
  }
}
