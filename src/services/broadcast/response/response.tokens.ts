import { BadRequestException, Injectable, Logger } from '@nestjs/common';
import { TokenSchema } from 'src/validation/schemas/tokens.schema';
import { EmailTransport } from '../mailer/mailer.transport';
import { API_KEY, API_USERNAME } from './response.secrets';
import { EmailOptions } from '../mailer/mailer.types';
import { ModuleRef } from '@nestjs/core';

const credentials = { apiKey: API_KEY, username: API_USERNAME }
// eslint-disable-next-line @typescript-eslint/no-var-requires
const AfricasTalking = require('africastalking')(credentials);

@Injectable()
export class ResponseService {
    constructor(private moduleRef: ModuleRef) { }

    private readonly emailTransport: EmailTransport

    private readonly logger = new Logger(ResponseService.name);

    /** validates tokens schema with validator (e.g: joi).  */
    private validateResponse(response: any) {
        const result = TokenSchema.validate(response)
        if (result.value) return result.value
        else throw new BadRequestException(result.error)
    }

    /** sends validated response to client. */
    public async respondToClient(token: string | string[], { role, permissions }) {
        const res = { permissions, role, token, verified: true };
        return this.validateResponse(res);
    }

    // /** method sends the login link with token to users via email.  */
    // public async respondViaEmail(response: any, options: EmailOptions) {
    //   const { TokensLogger } = await import('../logger/logger.tokens.js');
    //   const loggerT = await this.moduleRef.resolve(TokensLogger);
    //   try {
    //     return loggerT.logResponseToMail(response, options);
    //   } catch (e) {
    //     return loggerT.logError(e);
    //   }
    // }

    /** method sends the login link with token to users via email.  */
    public async respondViaEmail(options: EmailOptions) {
        await this.emailTransport.sendEmail(options)
            .then(res => {
                return { success: true, res }
            })
            .catch(error => {
                return { error, fail: true }
            })
    }

    /** method sends the OTP to user's phone-number  */
    public async respondViaOtp(number: string, otp: string | number) {
        //code here
        const sms = AfricasTalking.SMS
        const options = {
            to: [`${number}`],
            message: otp,
            from: 'Digital-Schools Team.'
        }
        // That’s it, hit send and we’ll take care of the rest
        sms.send(options)
            .then(console.log)
            .catch(console.log);
    }
}
