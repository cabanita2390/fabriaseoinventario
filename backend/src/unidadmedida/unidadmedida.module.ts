import { Module } from '@nestjs/common';
import { UnidadmedidaService } from './unidadmedida.service';
import { UnidadmedidaController } from './unidadmedida.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UnidadMedida } from 'src/entities/unidadmedida.entity';

@Module({
  imports: [
    // Aquí registramos la entidad para que TypeORM inyecte el repositorio
    TypeOrmModule.forFeature([UnidadMedida]),
  ],
  controllers: [UnidadmedidaController],
  providers: [UnidadmedidaService],
})
export class UnidadmedidaModule {}
