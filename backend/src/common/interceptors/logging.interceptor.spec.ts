import { describe, it, expect, jest, beforeEach } from '@jest/globals';
import {
  CallHandler,
  ExecutionContext,
  ForbiddenException,
  Logger,
} from '@nestjs/common';
import { lastValueFrom, of, throwError } from 'rxjs';
import { LoggingInterceptor } from './logging.interceptor';

function buildContext(request: object, response: object): ExecutionContext {
  return {
    getType: () => 'http',
    switchToHttp: () => ({
      getRequest: () => request,
      getResponse: () => response,
    }),
  } as unknown as ExecutionContext;
}

describe('LoggingInterceptor', () => {
  const interceptor = new LoggingInterceptor();
  let logSpy: any;
  let warnSpy: any;

  beforeEach(() => {
    logSpy = jest.spyOn(Logger.prototype, 'log').mockImplementation(() => {});
    warnSpy = jest.spyOn(Logger.prototype, 'warn').mockImplementation(() => {});
  });

  it('registra método, ruta, estado y usuario en una respuesta exitosa', async () => {
    const context = buildContext(
      { method: 'GET', originalUrl: '/api/reports', user: { id: 4 } },
      { statusCode: 200 },
    );
    const handler: CallHandler = { handle: () => of({ ok: true }) };

    const result = await lastValueFrom(interceptor.intercept(context, handler));

    expect(result).toEqual({ ok: true });
    expect(logSpy).toHaveBeenCalledTimes(1);
    const line = String(logSpy.mock.calls[0][0]);
    expect(line).toContain('GET /api/reports 200');
    expect(line).toContain('user=4');
  });

  it('registra una advertencia con el código del error y no lo traga', async () => {
    const context = buildContext(
      { method: 'PATCH', originalUrl: '/api/reports/1' },
      { statusCode: 200 },
    );
    const handler: CallHandler = {
      handle: () => throwError(() => new ForbiddenException()),
    };

    await expect(
      lastValueFrom(interceptor.intercept(context, handler)),
    ).rejects.toBeInstanceOf(ForbiddenException);

    expect(warnSpy).toHaveBeenCalledTimes(1);
    const line = String(warnSpy.mock.calls[0][0]);
    expect(line).toContain('PATCH /api/reports/1 403');
    expect(line).toContain('anon');
  });

  it('no registra el cuerpo de la petición', async () => {
    const context = buildContext(
      {
        method: 'POST',
        originalUrl: '/api/auth/login',
        body: { password: 'secreto123' },
      },
      { statusCode: 200 },
    );
    const handler: CallHandler = { handle: () => of({}) };

    await lastValueFrom(interceptor.intercept(context, handler));

    expect(String(logSpy.mock.calls[0][0])).not.toContain('secreto123');
  });
});