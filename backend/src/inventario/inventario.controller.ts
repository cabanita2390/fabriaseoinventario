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
  Query,
  ParseEnumPipe,
} from '@nestjs/common';
import { InventarioService } from './inventario.service';
import { CreateInventarioDto } from './dto/create-inventario.dto';
import { UpdateInventarioDto } from './dto/update-inventario.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import {
  ADMIN,
  RECEPTOR_MP,
  LIDER_PRODUCCION,
  OPERARIO_PRODUCCION,
  RECEPTOR_ENVASE,
  RECEPTOR_ETIQUETAS
} from '../auth/constants/roles.constant';
import { TipoProducto } from '../producto/dto/create-producto.dto';

@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(ADMIN)
@Controller('inventario')
export class InventarioController {
  constructor(private readonly inventarioService: InventarioService) {}

  @Post()
  @Roles(
    ADMIN,
    RECEPTOR_MP,
    LIDER_PRODUCCION,
    OPERARIO_PRODUCCION,
    RECEPTOR_ENVASE,
    RECEPTOR_ETIQUETAS
  )
  create(@Body() createInventarioDto: CreateInventarioDto) {
    return this.inventarioService.create(createInventarioDto);
  }

  @Get()
  @Roles(
    ADMIN,
    LIDER_PRODUCCION,
    OPERARIO_PRODUCCION,
    RECEPTOR_MP,
    RECEPTOR_ENVASE,
    RECEPTOR_ETIQUETAS,
    
  )
  findAll(
    @Query('tipoProducto', new ParseEnumPipe(TipoProducto, { optional: true }))
    tipoProducto?: TipoProducto,
  ) {
    return this.inventarioService.findAll(tipoProducto);
  }

  // Specific inventory endpoints
  @Get('materia-prima')
  @Roles(ADMIN, RECEPTOR_MP)
  findMateriaPrima() {
    return this.inventarioService.findByTipo(TipoProducto.MATERIA_PRIMA);
  }

  @Get('material-envase')
  @Roles(ADMIN,RECEPTOR_ENVASE)
  findMaterialEnvase() {
    return this.inventarioService.findByTipo(TipoProducto.MATERIAL_DE_ENVASE);
  }

  @Get('etiquetas')
  @Roles(ADMIN, RECEPTOR_ETIQUETAS)
  findEtiquetas() {
    return this.inventarioService.findByTipo(TipoProducto.ETIQUETAS);
  }

  @Get(':id')
  @Roles(ADMIN)
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.inventarioService.findOne(id);
  }

  @Patch(':id')
  @Roles(ADMIN)
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateInventarioDto: UpdateInventarioDto,
  ) {
    return this.inventarioService.update(id, updateInventarioDto);
  }

  @Delete(':id')
  @Roles(ADMIN)
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.inventarioService.remove(id);
  }
}