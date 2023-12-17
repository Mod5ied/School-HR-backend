import { Admin, AdminSchema } from 'src/entity/primary_entities/admin/admin.model';
import { RefreshToken, RefreshTokenSchema } from './models/refreshtokens.model';
import { AccessToken, AccessTokensSchema } from './models/accesstokens.model';
import { ResponseService } from '../broadcast/response/response.services';
import { CryptService } from '../encrypt/tokens.encrypt';
import { MongooseModule } from '@nestjs/mongoose';
import { TokenService } from './tokens.service';
import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: RefreshToken.name, schema: RefreshTokenSchema },
      { name: AccessToken.name, schema: AccessTokensSchema },
      { name: Admin.name, schema: AdminSchema }
    ]),
    JwtModule.register({}),
  ],
  providers: [TokenService, ResponseService, CryptService],
  exports: [TokenService, ResponseService, CryptService],
})
export class TokensModule { }
