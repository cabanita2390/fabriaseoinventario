import { Module } from '@nestjs/common';
import { ProveedorService } from './proveedor.service';
import { ProveedorController } from './proveedor.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Proveedor } from 'src/entities/proveedor.entity';

@Module({
  imports: [
    // Aquí registramos la entidad para que TypeORM inyecte el repositorio
    TypeOrmModule.forFeature([Proveedor]),
  ],
  controllers: [ProveedorController],
  providers: [ProveedorService],
})
export class ProveedorModule {}
