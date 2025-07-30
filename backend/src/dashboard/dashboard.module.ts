// src/dashboard/dashboard.module.ts
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DashboardService } from './dashboard.service';
import { DashboardController } from './dashboard.controller';
import { Usuario } from '../entities/usuario.entity';
import { Producto } from '../entities/producto.entity';
import { Inventario } from '../entities/inventario.entity';
import { Movimiento } from '../entities/movimiento.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Usuario, Producto, Inventario, Movimiento]),
  ],
  providers: [DashboardService],
  controllers: [DashboardController],
})
export class DashboardModule {}
