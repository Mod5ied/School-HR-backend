import { ConfigModule, ConfigService } from '@nestjs/config';
import { CacheModule, Global, Module } from '@nestjs/common';

@Global()
@Module({
    imports: [
        CacheModule.registerAsync({
            imports: [ConfigModule],
            inject: [ConfigService],
            useFactory: async (configService: ConfigService) => ({
                store: 'redis',
                host: configService.get<string>('REDIS_HOST'),
                port: configService.get<string>('REDIS_PORT'),
            }),
        }),
    ],
    exports: [CacheModule],
})
export class GlobalCacheModule { }
