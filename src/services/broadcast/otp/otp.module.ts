import { ConfigModule, ConfigService } from "@nestjs/config"
import * as redisStore from "cache-manager-redis-store"
import { CacheModule, Module } from "@nestjs/common";
import { OtpController } from "./otp.controller";
import { OtpService } from "./otp.service";

@Module({
    imports: [
        ConfigModule.forRoot({ cache: true }),
        CacheModule.registerAsync({
            imports: [ConfigModule],
            inject: [ConfigService],
            useFactory: (configService: ConfigService) => ({
                store: redisStore,
                // Store-specific configuration:
                host: configService.get('REDIS_HOST'),
                port: configService.get('REDIS_PORT'),
                ttl: 120 /* 2-mins */
            })
        })
    ],
    controllers: [OtpController],
    providers: [OtpService]
})
export class OtpModule { }
