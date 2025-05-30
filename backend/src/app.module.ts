/* eslint-disable prettier/prettier */
import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule, ConfigService  } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
  imports: [
    
    // 1) Cargar el módulo de configuración
    ConfigModule.forRoot({ isGlobal: true }),

    // 2) Configurar TypeORM de forma asíncrona
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        type: 'postgres',
        host: config.get<string>('DB_HOST'),
        port: config.get<number>('DB_PORT'),      // ConfigService convierte a number si tu .env declara DB_PORT=5432
        username: config.get<string>('DB_USER'),
        password: config.get<string>('DB_PASS'),
        database: config.get<string>('DB_NAME'),
        autoLoadEntities: true,
        synchronize: true, // solo en desarrollo
      }),
    }),
  
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
