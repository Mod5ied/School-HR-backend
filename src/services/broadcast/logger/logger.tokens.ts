import { EmailTransport } from '../mailer/mailer.transport';
import { LoggerOptions, transports, format } from 'winston';
import { ITokensOk, ITokensErr } from './logger.types';
import { EmailOptions } from '../mailer/mailer.types';
import { Injectable, Logger } from '@nestjs/common';

export const loggerConfig: LoggerOptions = {
  level: 'info',
  format: format.combine(
    format.timestamp(),
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    format.printf(({ timestamp, level, message }) => {
      return `\${timestamp} \${level.toUpperCase()}: \${message}`;
    }),
  ),
  transports: [new transports.Console()],
};

//TODO: Ensure that the response being sent passes ZOD validation.

@Injectable()
export class TokensLogger {
  constructor(
    private readonly logger = new Logger(TokensLogger.name),
    private readonly emailTransport: EmailTransport,
  ) {}

  /** Method used to send emails with tokens to users.  */
  public async logResponseToMail(resp: string, emailOptions: EmailOptions) {
    let tokenInterface: ITokensOk;
    let errInterface: ITokensErr;
    try {
      this.logger.log((tokenInterface.metadata.data = resp));
      return await this.emailTransport.sendEmail(emailOptions);
    } catch (e) {
      return this.logger.error(`[Token_Logging] - ${(errInterface.error = e)}`);
    }
  }

  /** Deprecated. Use the logger instance directly in your service. */
  public logResponse(resp: any) {
    let tokenInterface: ITokensOk;
    return this.logger.log((tokenInterface.metadata.data = resp));
  }

  /** Deprecated. Use the logger instance directly in your service. */
  public logError(err: string) {
    let errInterface: ITokensErr;
    return this.logger.error(`[Token_Logging] - ${(errInterface.error = err)}`);
  }

  /** Method logs and sends App level critical error to Developers for diagnosis */
  public async logErrorToMail(err: string, emailOptions: EmailOptions) {
    let errInterface: ITokensErr;
    try {
      this.logger.error((errInterface.error = err));
      return await this.emailTransport.sendEmail(emailOptions);
    } catch (e) {
      return this.logger.error(
        `[Token_Logging] - ${(errInterface.error =
          e)}; ${(errInterface.metadata.message =
          "Err at 'logErrorToMail' method")}`,
      );
    }
  }
}
