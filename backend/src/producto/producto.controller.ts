import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  ParseIntPipe,
  UseGuards,
} from '@nestjs/common';
import { ProductoService } from './producto.service';
import { CreateProductoDto } from './dto/create-producto.dto';
import { UpdateProductoDto } from './dto/update-producto.dto';
import { Roles } from 'src/auth/decorators/roles.decorator';
import {
  ADMIN,
  LIDER_PRODUCCION,
  RECEPTOR_INSUMOS,
  RECEPTOR_MP,
} from 'src/auth/constants/roles.constant';
import { RolesGuard } from 'src/auth/guards/roles.guard';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';

// @UseGuards(JwtAuthGuard, RolesGuard)
@Controller('producto')
export class ProductoController {
  constructor(private readonly productoService: ProductoService) {}

  @Post()
  @Roles(ADMIN,  LIDER_PRODUCCION)
  async create(@Body() dto: CreateProductoDto) {
    return this.productoService.create(dto);
  }

  @Get()
  @Roles(ADMIN, RECEPTOR_MP, RECEPTOR_INSUMOS, LIDER_PRODUCCION)
  async findAll() {
    return this.productoService.findAll();
  }

  @Get(':id')
  @Roles(ADMIN, RECEPTOR_MP, RECEPTOR_INSUMOS, LIDER_PRODUCCION)
  async findOne(@Param('id', ParseIntPipe) id: number) {
    return this.productoService.findOne(id);
  }

  @Patch(':id')
  @Roles(ADMIN, )
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateProductoDto,
  ) {
    return this.productoService.update(id, dto);
  }

  @Delete(':id')
  @Roles(ADMIN,)
  async remove(@Param('id', ParseIntPipe) id: number) {
    return this.productoService.remove(id);
  }
}
