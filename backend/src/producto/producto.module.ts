import { Module } from '@nestjs/common';
import { ProductoService } from './producto.service';
import { ProductoController } from './producto.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Producto } from 'src/entities/producto.entity';

@Module({
  imports: [
    // Aquí registramos la entidad para que TypeORM inyecte el repositorio
    TypeOrmModule.forFeature([Producto]),
  ],
  controllers: [ProductoController],
  providers: [ProductoService],
})
export class ProductoModule {}
