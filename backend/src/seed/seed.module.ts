import { Module } from '@nestjs/common';
import { SeedService } from './seed/seed.service';
import { SeedController } from './seed/seed.controller';
import { Presentacion } from 'src/entities/presentacion.entity';
import { UnidadMedida } from 'src/entities/unidadmedida.entity';
import { Producto } from 'src/entities/producto.entity';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
  imports: [
    // Registra aquí todas las entidades que usas en SeedService
    TypeOrmModule.forFeature([Presentacion, UnidadMedida, Producto]),
  ],
  providers: [SeedService],
  controllers: [SeedController],
})
export class SeedModule {}
