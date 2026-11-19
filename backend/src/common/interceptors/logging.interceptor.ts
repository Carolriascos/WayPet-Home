import {
  CallHandler,
  ExecutionContext,
  HttpException,
  Injectable,
  Logger,
  NestInterceptor,
} from '@nestjs/common';
import type { Request, Response } from 'express';
import { Observable, tap } from 'rxjs';

type RequestWithUser = Request & { user?: { id: number } };


@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  private readonly logger = new Logger('HTTP');

  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    if (context.getType() !== 'http') {
      return next.handle();
    }

    const http = context.switchToHttp();
    const request = http.getRequest<RequestWithUser>();
    const response = http.getResponse<Response>();
    const startedAt = Date.now();

    const write = (status: number, failed: boolean) => {
      const user = request.user ? `user=${request.user.id}` : 'anon';
      const line = `${request.method} ${request.originalUrl} ${status} ${Date.now() - startedAt}ms ${user}`;
      if (failed) {
        this.logger.warn(line);
      } else {
        this.logger.log(line);
      }
    };

    return next.handle().pipe(
      tap({
        next: () => write(response.statusCode, false),
        error: (error: unknown) => {
          const status =
            error instanceof HttpException ? error.getStatus() : 500;
          write(status, true);
        },
      }),
    );
  }
}