import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import type { Request, Response } from 'express';
import { BusinessException } from '../errors/business.exception';
import { ErrorCode } from '../errors/error-codes';
import type { ApiErrorResponse } from '../interfaces/error-response.interface';

/**
 * Filtre global : garantit une enveloppe d'erreur JSON unique :
 * { statusCode, message, code, errors?, timestamp, path, requestId }
 * Ne laisse jamais fuiter de secret ni de stack trace en production.
 */
@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  private readonly logger = new Logger('ExceptionFilter');

  catch(exception: unknown, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request & { id?: string }>();

    const status =
      exception instanceof HttpException ? exception.getStatus() : HttpStatus.INTERNAL_SERVER_ERROR;

    let message: string | string[] = 'Une erreur inattendue est survenue.';
    let code: string = ErrorCode.INTERNAL_ERROR;
    let errors: Record<string, string[]> | undefined;

    if (exception instanceof BusinessException) {
      message = (exception.getResponse() as { message: string | string[] }).message;
      code = exception.code;
      errors = exception.details as Record<string, string[]> | undefined;
    } else if (exception instanceof HttpException) {
      const payload = exception.getResponse();
      if (typeof payload === 'string') {
        message = payload;
      } else if (typeof payload === 'object' && payload !== null) {
        const record = payload as Record<string, unknown>;
        message = (record.message as string | string[]) ?? message;
        if (Array.isArray(record.message)) {
          errors = { _: record.message as string[] };
        }
        if (typeof record.error === 'string' && record.error) {
          code = this.mapStatusToCode(status, record.error);
        }
      }
      code = code === ErrorCode.INTERNAL_ERROR ? this.mapStatusToCode(status) : code;
    }

    // Les erreurs 500 ne doivent jamais exposer le message interne.
    if (status >= HttpStatus.INTERNAL_SERVER_ERROR) {
      this.logger.error(
        `${request.method} ${request.url} → ${status}`,
        exception instanceof Error ? exception.stack : String(exception),
      );
      if (process.env.NODE_ENV === 'production') {
        message = 'Une erreur interne est survenue.';
      }
    } else {
      this.logger.warn(
        `${request.method} ${request.url} → ${status} [${code}] ${
          Array.isArray(message) ? message.join(' | ') : message
        }`,
      );
    }

    const body: ApiErrorResponse = {
      statusCode: status,
      message,
      code,
      ...(errors ? { errors } : {}),
      timestamp: new Date().toISOString(),
      path: request.url,
      ...(request.id ? { requestId: request.id } : {}),
    };

    response.status(status).json(body);
  }

  private mapStatusToCode(status: number, fallback?: string): string {
    switch (status) {
      case HttpStatus.BAD_REQUEST:
        return ErrorCode.BAD_REQUEST;
      case HttpStatus.UNAUTHORIZED:
        return ErrorCode.UNAUTHORIZED;
      case HttpStatus.FORBIDDEN:
        return ErrorCode.FORBIDDEN;
      case HttpStatus.NOT_FOUND:
        return ErrorCode.NOT_FOUND;
      case HttpStatus.CONFLICT:
        return ErrorCode.CONFLICT;
      case HttpStatus.UNPROCESSABLE_ENTITY:
        return ErrorCode.VALIDATION_ERROR;
      case HttpStatus.TOO_MANY_REQUESTS:
        return ErrorCode.TOO_MANY_REQUESTS;
      case HttpStatus.PAYLOAD_TOO_LARGE:
        return ErrorCode.PAYLOAD_TOO_LARGE;
      case HttpStatus.UNSUPPORTED_MEDIA_TYPE:
        return ErrorCode.UNSUPPORTED_MEDIA_TYPE;
      case HttpStatus.INTERNAL_SERVER_ERROR:
        return ErrorCode.INTERNAL_ERROR;
      default:
        return fallback ?? ErrorCode.BAD_REQUEST;
    }
  }
}
