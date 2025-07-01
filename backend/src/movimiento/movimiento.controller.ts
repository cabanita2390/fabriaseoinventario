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
  RECEPTOR_INSUMOS,
  RECEPTOR_MP,
} from 'src/auth/constants/roles.constant';
import { Roles } from 'src/auth/decorators/roles.decorator';

@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('movimiento')
export class MovimientoController {
  constructor(private readonly movimientoService: MovimientoService) {}

  @Post()
  @Roles(ADMIN, RECEPTOR_INSUMOS, RECEPTOR_MP)
  async create(@Body() createMovimientoDto: CreateMovimientoDto) {
    return this.movimientoService.create(createMovimientoDto);
  }

  @Get()
  @Roles(ADMIN)
  async findAll() {
    return this.movimientoService.findAll();
  }

  @Get(':id')
  @Roles(ADMIN)
  async findOne(@Param('id', ParseIntPipe) id: number) {
    return this.movimientoService.findOne(id);
  }

  @Patch(':id')
  @Roles(ADMIN)
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateMovimientoDto: UpdateMovimientoDto,
  ) {
    return this.movimientoService.update(id, updateMovimientoDto);
  }

  @Delete(':id')
  @Roles(ADMIN)
  async remove(@Param('id', ParseIntPipe) id: number) {
    return this.movimientoService.remove(id);
  }
}
