import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  Patch,
  ParseIntPipe,
  UseGuards,
} from '@nestjs/common';
import { MovimientoService } from './movimiento.service';
import { CreateMovimientoDto } from './dto/create-movimiento.dto';
import { UpdateMovimientoDto } from './dto/update-movimiento.dto';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { RolesGuard } from 'src/auth/guards/roles.guard';
import {
  ADMIN,
  LIDER_PRODUCCION,
  OPERARIO_PRODUCCION,
  RECEPTOR_ENVASE,
  RECEPTOR_ETIQUETAS,
  RECEPTOR_MP,
} from 'src/auth/constants/roles.constant';
import { Roles } from 'src/auth/decorators/roles.decorator';
import { TipoProducto } from 'src/producto/dto/create-producto.dto';

@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('movimiento')
export class MovimientoController {
  constructor(private readonly movimientoService: MovimientoService) {}

  // Crear por tipo
  @Post('materia-prima')
  @Roles(ADMIN, RECEPTOR_MP,LIDER_PRODUCCION)
  createMateriaPrima(@Body() dto: CreateMovimientoDto) {
    return this.movimientoService.createMateriaPrima(dto);
  }

  @Post('material-envase')
  @Roles(ADMIN, RECEPTOR_ENVASE, OPERARIO_PRODUCCION)
  createMaterialEnvase(@Body() dto: CreateMovimientoDto) {
    return this.movimientoService.createMaterialEnvase(dto);
  }

  @Post('etiquetas')
  @Roles(ADMIN, RECEPTOR_ETIQUETAS, OPERARIO_PRODUCCION)
  createEtiquetas(@Body() dto: CreateMovimientoDto) {
    return this.movimientoService.createEtiquetas(dto);
  }

  // Listar todos
  @Get()
  @Roles(ADMIN, LIDER_PRODUCCION, OPERARIO_PRODUCCION)
  findAll() {
    return this.movimientoService.findAll();
  }

  // Listar por tipo
  @Get('materia-prima')
  @Roles(ADMIN, RECEPTOR_MP, LIDER_PRODUCCION)
  findMateriaPrima() {
    return this.movimientoService.findByTipo(TipoProducto.MATERIA_PRIMA);
  }

  @Get('material-envase')
  @Roles(ADMIN, RECEPTOR_ENVASE, LIDER_PRODUCCION,OPERARIO_PRODUCCION)
  findMaterialEnvase() {
    return this.movimientoService.findByTipo(TipoProducto.MATERIAL_DE_ENVASE);
  }

  @Get('etiquetas')
  @Roles(ADMIN, RECEPTOR_ETIQUETAS, LIDER_PRODUCCION,OPERARIO_PRODUCCION)
  findEtiquetas() {
    return this.movimientoService.findByTipo(TipoProducto.ETIQUETAS);
  }

  // Detalle, actualizar, eliminar
  @Get(':id')
  @Roles(ADMIN, LIDER_PRODUCCION)
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.movimientoService.findOne(id);
  }

  @Patch(':id')
  @Roles(ADMIN)
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateMovimientoDto,
  ) {
    return this.movimientoService.update(id, dto);
  }

  @Delete(':id')
  @Roles(ADMIN)
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.movimientoService.remove(id);
  }
}
