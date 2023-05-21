import { WinstonModule, WINSTON_MODULE_PROVIDER } from 'nest-winston';
import { EmailTransport } from '../broadcast/mailer/mailer.transport';
import { TokensLogger } from './logger.entities';
import { Module } from '@nestjs/common';
import winston from 'winston';

@Module({
    imports: [
        WinstonModule.forRoot({
            transports: [
                new winston.transports.Console({
                    format: winston.format.combine(
                        winston.format.timestamp(),
                        winston.format.printf(({ timestamp, level, message }) => {
                            return `[${timestamp}] ${level}: ${message}`;
                        }),
                    ),
                }),
                new winston.transports.Console()
            ],
        }),
    ],
    providers: [
        TokensLogger,
        EmailTransport,
        {
            provide: WINSTON_MODULE_PROVIDER,
            useExisting: WinstonModule,
        },
    ],
    exports: [TokensLogger],
})
export class TokensLoggerModule { }