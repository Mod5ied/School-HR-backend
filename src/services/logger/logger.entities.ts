import { Injectable, Logger } from '@nestjs/common';

@Injectable()
export class TokensLogger {
  constructor(
    private readonly logger = new Logger(TokensLogger.name),
  ) {}
}