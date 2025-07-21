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
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { RolesGuard } from 'src/auth/guards/roles.guard';
import { Roles } from 'src/auth/decorators/roles.decorator';
import { ADMIN, RECEPTOR_MP } from 'src/auth/constants/roles.constant';
import { TipoProducto } from 'src/producto/dto/create-producto.dto';

@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(ADMIN)
@Controller('inventario')
export class InventarioController {
  constructor(private readonly inventarioService: InventarioService) {}

  @Post()
  @Roles(ADMIN, RECEPTOR_MP)
  create(@Body() createInventarioDto: CreateInventarioDto) {
    return this.inventarioService.create(createInventarioDto);
  }
  @Get()
  @Roles(ADMIN)
  findAll(
    @Query('tipoProducto', new ParseEnumPipe(TipoProducto))
    tipoProducto?: TipoProducto,
  ) {
    return this.inventarioService.findAll(tipoProducto);
  }

  @Roles(ADMIN)
  @Get(':id')
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
