import { ConfigModule, ConfigService } from '@nestjs/config';
import * as redisStore from 'cache-manager-redis-store';
import { Global, Module } from "@nestjs/common";
import { CacheService } from "./cache.service";
import { CacheModule } from "@nestjs/common";

@Global()
@Module({
    imports: [
        ConfigModule.forRoot({ cache: true }),
        CacheModule.registerAsync({
            imports: [ConfigModule],
            inject: [ConfigService],
            useFactory: async (configService: ConfigService) => ({
                store: redisStore,
                host: configService.get<string>('REDIS_HOST'),
                port: configService.get<string>('REDIS_PORT'),
            })
        }),
    ],
    providers: [CacheService],
    exports: [CacheService]
})

export class NestCacheModule { }