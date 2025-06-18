// src/movimiento/movimiento.module.ts
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MovimientoService } from './movimiento.service';
import { MovimientoController } from './movimiento.controller';
import { Movimiento } from '../entities/movimiento.entity';
import { Inventario } from 'src/entities/inventario.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Movimiento, Inventario])],
  controllers: [MovimientoController],
  providers: [MovimientoService],
})
export class MovimientoModule {}
