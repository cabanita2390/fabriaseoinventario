// src/common/filters/query-failed.filter.ts
import { ExceptionFilter, Catch, ArgumentsHost, Logger } from '@nestjs/common';
import { QueryFailedError } from 'typeorm';

@Catch(QueryFailedError)
export class QueryFailedFilter implements ExceptionFilter {
  private readonly logger = new Logger(QueryFailedFilter.name); // 👉 Logger agregado

  catch(exception: QueryFailedError, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const response = ctx.getResponse();

    const code = (exception as any).code as string;
    const detail = (exception as any).detail as string;

    let message = 'Error en la base de datos';
    if (code === '23505') {
      message = 'Violación de restricción única (valor duplicado)';
    } else if (code === '23503') {
      message = 'Violación de llave foránea (registro relacionado no existe)';
    }

    // 👉 Log detallado para depuración
    this.logger.error(`Database Error: ${code} - ${detail}`);

    response.status(400).json({
      statusCode: 400,
      message,
      error: detail, // 👉 En desarrollo puede ser útil enviar el detalle completo
    });
  }
}
