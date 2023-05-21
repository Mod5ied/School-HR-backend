import { AccessToken, AccessTokensSchema } from './models/accesstokens.model';
import { RefreshToken, RefreshTokenSchema } from './models/refreshtokens.model';
import { ResponseService } from '../broadcast/response/reponse.tokens';
import { CryptService } from '../encrypt/tokens.encrypt';
import { MongooseModule } from '@nestjs/mongoose';
import { TokenService } from './tokens.service';
import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { TokenCtrlr } from './tokens.controller';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: AccessToken.name, schema: AccessTokensSchema },
      { name: RefreshToken.name, schema: RefreshTokenSchema },
    ]),
    JwtModule.register({}),
  ],
  controllers: [TokenCtrlr],
  providers: [TokenService, ResponseService, CryptService],
  exports: [TokenService, ResponseService, CryptService],
})
export class TokensModule { }
