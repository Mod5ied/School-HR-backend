import { BadRequestException, Injectable, Logger } from '@nestjs/common';
import { TokenSchema } from 'src/validation/schemas/tokens.schema';
import { CacheService } from 'src/services/cache/cache.service';
import { EventEmitter2, OnEvent } from '@nestjs/event-emitter';
import { API_KEY, API_USERNAME } from './response.secrets';
import { TokensDto } from 'src/validation/dtos/tokens.dto';
import { EmailOptions } from '../mailer/mailer.types';
// import { EmailTransport } from '../mailer/mailer.transport';

const credentials = { apiKey: API_KEY, username: API_USERNAME }
// eslint-disable-next-line @typescript-eslint/no-var-requires
const AfricasTalking = require('africastalking')(credentials);

@Injectable()
export class ResponseService {
    private stopEvent = false;
    constructor(
        private readonly cacheService: CacheService,
        private readonly eventEmitter: EventEmitter2,
        // private readonly logger = new Logger(ResponseService.name)
    ) { }
    // private readonly emailTransport = new EmailTransport()

    /** `validateResponse` validates tokens schema with validator (e.g: joi).  */
    private validateResponse(response: unknown) {
        const result = TokenSchema.validate(response)
        if (result.error) throw new BadRequestException(result.error)
        if (!this.stopEvent) this.eventEmitter.emit("cache-response", result.value);
        return result.value;
    }
    @OnEvent("cache-response")
    async cacheResponse(payload: TokensDto) {
        const { phoneNumber } = payload;
        if (!this.stopEvent) setTimeout(async () => {
            await this.cacheService.setCache(`${phoneNumber}-loginResponse`, payload, 28800), 1000
            return this.stopEvent = true;
        })
    }

    /** `respondToClient` sends validated response to client. */
    public async verifiedResponse(token: string, encryptionKey: string, { role, permissions, phoneNumber }) {
        const res = { permissions, role, token, encryptionKey, phoneNumber, verified: true };
        return await this.validateResponse(res);
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

    /** `respondViaEmail` method sends the login link with token to users via email.  */
    public async respondViaEmail(options: EmailOptions) {
        // await this.emailTransport.sendEmail(options)
        //     .then(res => {
        //         return { success: true, res }
        //     })
        //     .catch(error => {
        //         return { error, fail: true }
        //     })
    }

    /** `respondViaOtp` method sends the OTP to user's phone-number  */
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
