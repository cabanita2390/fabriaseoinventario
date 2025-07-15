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
import { ADMIN, RECEPTOR_MP,LIDER_PRODUCCION,RECEPTOR_ENVASE,RECEPTOR_ETIQUETAS } from 'src/auth/constants/roles.constant';
import { Roles } from 'src/auth/decorators/roles.decorator';
import { TipoProducto } from 'src/producto/dto/create-producto.dto';

@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('movimiento')
export class MovimientoController {
  constructor(private readonly movimientoService: MovimientoService) {}

  // Crear por tipo
  @Post('materia-prima')
  @Roles( RECEPTOR_MP)
  createMateriaPrima(@Body() dto: CreateMovimientoDto) {
    return this.movimientoService.createMateriaPrima(dto);
  }

  @Post('material-envase')
  @Roles(ADMIN)
  createMaterialEnvase(@Body() dto: CreateMovimientoDto) {
    return this.movimientoService.createMaterialEnvase(dto);
  }

  @Post('etiquetas')
  @Roles(ADMIN)
  createEtiquetas(@Body() dto: CreateMovimientoDto) {
    return this.movimientoService.createEtiquetas(dto);
  }

  // Listar todos
  @Get()
  @Roles(ADMIN,LIDER_PRODUCCION)
  findAll() {
    return this.movimientoService.findAll();
  }

  // Listar por tipo
  @Get('materia-prima')
  @Roles(RECEPTOR_MP)
  findMateriaPrima() {
    return this.movimientoService.findByTipo(TipoProducto.MATERIA_PRIMA);
  }

  @Get('material-envase')
  @Roles(RECEPTOR_ENVASE)
  findMaterialEnvase() {
    return this.movimientoService.findByTipo(TipoProducto.MATERIAL_DE_ENVASE);
  }

  @Get('etiquetas')
  @Roles(RECEPTOR_ETIQUETAS)
  findEtiquetas() {
    return this.movimientoService.findByTipo(TipoProducto.ETIQUETAS);
  }

  // Detalle, actualizar, eliminar
  @Get(':id')
  @Roles(ADMIN)
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
