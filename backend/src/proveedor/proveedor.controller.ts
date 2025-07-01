import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  ParseIntPipe,
  UseGuards, // 👉 Agregado para validación de parámetros
} from '@nestjs/common';
import { ProveedorService } from './proveedor.service';
import { CreateProveedorDto } from './dto/create-proveedor.dto';
import { UpdateProveedorDto } from './dto/update-proveedor.dto';
import { Roles } from 'src/auth/decorators/roles.decorator';
import { ADMIN } from 'src/auth/constants/roles.constant';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { RolesGuard } from 'src/auth/guards/roles.guard';

@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('proveedor')
export class ProveedorController {
  constructor(private readonly proveedorService: ProveedorService) {}

  @Post()
  @Roles(ADMIN)
  create(@Body() createProveedorDto: CreateProveedorDto) {
    return this.proveedorService.create(createProveedorDto);
  }

  @Get()
  @Roles(ADMIN)
  findAll() {
    return this.proveedorService.findAll();
  }

  @Get(':id')
  @Roles(ADMIN)
  findOne(@Param('id', ParseIntPipe) id: number) {
    // 👉 Validación agregada
    return this.proveedorService.findOne(id);
  }

  @Patch(':id')
  @Roles(ADMIN)
  update(
    @Param('id', ParseIntPipe) id: number, // 👉 Validación agregada
    @Body() updateProveedorDto: UpdateProveedorDto,
  ) {
    return this.proveedorService.update(id, updateProveedorDto);
  }

  @Delete(':id')
  @Roles(ADMIN)
  remove(@Param('id', ParseIntPipe) id: number) {
    // 👉 Validación agregada
    return this.proveedorService.remove(id);
  }
}
