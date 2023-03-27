import { Controller, Get, Post } from '@nestjs/common';
import { AppService } from './app.service';

@Controller('api')
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get('state')
  getHello(): string {
    // return this.appService.getHello();
    return "in progress.."
  }

  @Post('')
  postHello(): string {
    // return this.appService.postHello();
    return "in progress.."
  }
}
