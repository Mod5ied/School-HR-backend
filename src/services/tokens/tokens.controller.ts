import { Controller, Post, Get, Body, Query } from '@nestjs/common';
import { TokenService } from './tokens.service';
import { Users } from './tokens.types';

/* TODO: use an inteceptor to ensure that errors are 
  sifted and sent to the logs */

@Controller('token')
export class TokenCtrlr {
  constructor(private tokenService: TokenService) { }

  @Get()
  async getUserTokens(@Body() user: Partial<Users>) {
    return this.tokenService.generateTokens(user);
  }

  @Post('verify')
  async verifyAccessToken(@Query('token') token: string, @Query('email') email: string) {
    return this.tokenService.runVerifyAccessToken(token, email);
  }
}