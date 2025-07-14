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
import { ADMIN, RECEPTOR_MP } from 'src/auth/constants/roles.constant';
import { Roles } from 'src/auth/decorators/roles.decorator';

@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('movimiento')
export class MovimientoController {
  constructor(private readonly movimientoService: MovimientoService) {}

  // Crear
  @Post('materia-prima')
  @Roles(ADMIN, RECEPTOR_MP)
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
  @Get('materia-prima')
  @Roles(ADMIN)
  findMateriaPrima() {
    return this.movimientoService.findByTipo('materia-prima');
  }

  @Get('material-envase')
  @Roles(ADMIN)
  findMaterialEnvase() {
    return this.movimientoService.findByTipo('material-envase');
  }

  @Get('etiquetas')
  @Roles(ADMIN)
  findEtiquetas() {
    return this.movimientoService.findByTipo('etiquetas');
  }

  // Ver uno, actualizar o eliminar siguen siendo por ID genérico
  @Get(':id')
  @Roles(ADMIN)
  async findOne(@Param('id', ParseIntPipe) id: number) {
    return this.movimientoService.findOne(id);
  }

  @Patch(':id')
  @Roles(ADMIN)
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateMovimientoDto,
  ) {
    return this.movimientoService.update(id, dto);
  }

  @Delete(':id')
  @Roles(ADMIN)
  async remove(@Param('id', ParseIntPipe) id: number) {
    return this.movimientoService.remove(id);
  }
}
