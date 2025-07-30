// src/main.ts
import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
// import { QueryFailedFilter } from './common/filters/query-failed.filter';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    cors: {
      origin: process.env.CORS_ORIGIN?.split(',') || '*', // Mejor control desde variables de entorno
      methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization'],
      credentials: true,
    },
  });

  // Pipes globales para validación de DTOs
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true, // Elimina propiedades que no estén en el DTO
      forbidNonWhitelisted: true, // Lanza error si se envían propiedades no permitidas
      transform: true, // Convierte los tipos (por ejemplo, string a number)
      transformOptions: {
        enableImplicitConversion: true, // Aún mejor conversión de tipos (si se usan @Type en DTOs)
      },
    }),
  );

  // Habilitar filtros globales personalizados si están implementados
  // app.useGlobalFilters(new QueryFailedFilter());

  const port = process.env.PORT || 3000;
  console.log(`🚀 App corriendo en puerto ${port}`);
  await app.listen(port);
}

bootstrap();
