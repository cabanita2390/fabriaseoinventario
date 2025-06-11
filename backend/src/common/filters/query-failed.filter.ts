/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
// src/common/filters/query-failed.filter.ts
import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  //   BadRequestException,
} from '@nestjs/common';
import { QueryFailedError } from 'typeorm';

@Catch(QueryFailedError)
export class QueryFailedFilter implements ExceptionFilter {
  catch(exception: QueryFailedError, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse();
    const code = (exception as any).code as string;

    let message = 'Error en la base de datos';
    if (code === '23505') {
      message = 'Violación de restricción única (valor duplicado)';
    } else if (code === '23503') {
      message = 'Violación de llave foránea (registro relacionado no existe)';
    }

    response.status(400).json({
      statusCode: 400,
      message,
    });
  }
}
