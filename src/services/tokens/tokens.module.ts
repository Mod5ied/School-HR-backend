import { Module } from '@nestjs/common';
import { TokenService } from './tokens.service';
import { MongooseModule } from '@nestjs/mongoose';
import { AccessToken, AccessTokensSchema } from './models/accesstokens.model';
import { RefreshToken, RefreshTokenSchema } from './models/refreshtokens.model';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: AccessToken.name, schema: AccessTokensSchema },
      { name: RefreshToken.name, schema: RefreshTokenSchema },
    ]),
  ],
  providers: [TokenService],
})
export class TokensModule {}
