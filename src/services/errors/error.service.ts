import { ErrorDto, ErrorSchema } from 'src/schemas/errors/error.schema';
import { Injectable, Logger } from '@nestjs/common';
import { HttpStatusEnum } from './error.types';

/** Parses an err response and concurrently logs it */
@Injectable()
export class ErrorService {
  constructor(private code: HttpStatusEnum, private errMessage: string) {}
  
  private readonly logger = new Logger(ErrorService.name);

  private createErrorResponse(): ErrorDto {
    this.logger.error(this.errMessage);
    const errorResponse = {
      ok: false,
      code: this.code,
      error: this.errMessage,
      metadata: { messages: `[ERROR_Details] - ${this.errMessage}` },
    };
    const validateResult = ErrorSchema.safeParse(errorResponse);

    if (validateResult.success) return validateResult.data;
    this.logger.error(`Zod validation failed: ${validateResult}`);
    return;
  }

  public badRequest(errMessage: string) {
    this.code = HttpStatusEnum.BAD_REQUEST;
    this.errMessage = errMessage;
    return this.createErrorResponse();
  }

  public unauthorizedRequest(errMessage: string) {
    this.code = HttpStatusEnum.UNAUTHORIZED;
    this.errMessage = errMessage;
    return this.createErrorResponse();
  }

  public forbiddenRequest(errMessage: string) {
    this.code = HttpStatusEnum.FORBIDDEN;
    this.errMessage = errMessage;
    return this.createErrorResponse();
  }
  public notAvailableRequest(errMessage: string) {
    this.code = HttpStatusEnum.GONE;
    this.errMessage = errMessage;
    return this.createErrorResponse();
  }

  public internalError(errMessage: string) {
    this.code = HttpStatusEnum.INTERNAL_SERVER_ERROR;
    this.errMessage = errMessage;
    return this.createErrorResponse();
  }
  public methodNotImplemented(errMessage: string) {
    this.code = HttpStatusEnum.NOT_IMPLEMENTED;
    this.errMessage = errMessage;
    return this.createErrorResponse();
  }
}
