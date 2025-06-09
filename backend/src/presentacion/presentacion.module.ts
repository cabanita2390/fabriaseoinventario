// src/presentacion/presentacion.module.ts
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PresentacionService } from './presentacion.service';
import { PresentacionController } from './presentacion.controller';
import { Presentacion } from '../entities/presentacion.entity';

@Module({
  imports: [
    // Aquí registramos la entidad para que TypeORM inyecte el repositorio
    TypeOrmModule.forFeature([Presentacion]),
  ],
  controllers: [PresentacionController],
  providers: [PresentacionService],
})
export class PresentacionModule {}
