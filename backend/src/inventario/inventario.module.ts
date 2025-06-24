// src/inventario/inventario.module.ts
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { InventarioService } from './inventario.service';
import { InventarioController } from './inventario.controller';
import { Inventario } from '../entities/inventario.entity';
import { Producto } from 'src/entities/producto.entity';
import { Bodega } from 'src/entities/bodega.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Inventario, Producto, Bodega])],
  controllers: [InventarioController],
  providers: [InventarioService],
})
export class InventarioModule {}
