import { Module } from '@nestjs/common';
import { ProductoService } from './producto.service';
import { ProductoController } from './producto.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Producto } from 'src/entities/producto.entity';
import { Presentacion } from 'src/entities/presentacion.entity';
import { UnidadMedida } from 'src/entities/unidadmedida.entity';
import { Proveedor } from 'src/entities/proveedor.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Producto,
      Presentacion,
      UnidadMedida,
      Proveedor, // <-- aquí agregas las demás entidades
    ]),
  ],
  controllers: [ProductoController],
  providers: [ProductoService],
})
export class ProductoModule {}
