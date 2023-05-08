import { TokenService } from './tokens.service';
import { Users } from './tokens.types';
import {
  Controller,
  Post,
  Get,
  Body,
  Param,
} from '@nestjs/common';

@Controller('token')
export class TokenCtrlr {
  constructor(private tokenService: TokenService) { }

  @Get()
  async getUserTokens(@Body() user: Users) {
    return this.tokenService.generateTokens(user);
  }

  @Post('/verify/:token/:email')
  async verifyAccessToken(@Param('token') params: { user_token: string, user_email: string }) {
    const { user_token, user_email } = params;
    return this.tokenService.runVerifyAccessToken(user_token, user_email);
  }
}
