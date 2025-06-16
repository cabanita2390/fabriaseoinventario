// src/main.ts
import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
// import { QueryFailedFilter } from './common/filters/query-failed.filter';

async function bootstrap() {
  // Crea la app con CORS habilitado
  const app = await NestFactory.create(AppModule, {
    cors: {
      origin: '*', // o pon aquí tu dominio: ['https://mi-frontend.com']
      methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization'],
      credentials: true,
    },
  });

  // Pipes de validación global
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  // Si tienes filtros globales:
  // app.useGlobalFilters(new QueryFailedFilter());

  const port = process.env.PORT || 3000;
  console.log(`🚀 App corriendo en puerto ${port}`);
  await app.listen(port);
}

bootstrap();
