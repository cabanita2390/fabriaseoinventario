import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  ParseIntPipe, // 👉 Agregado para validación de parámetros
} from '@nestjs/common';
import { RolService } from './rol.service';
import { CreateRolDto } from './dto/create-rol.dto';
import { UpdateRolDto } from './dto/update-rol.dto';

@Controller('rol')
export class RolController {
  constructor(private readonly rolService: RolService) {}

  @Post()
  create(@Body() createRolDto: CreateRolDto) {
    return this.rolService.create(createRolDto);
  }

  @Get()
  findAll() {
    return this.rolService.findAll();
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    // 👉 Validación agregada
    return this.rolService.findOne(id);
  }

  @Patch(':id')
  update(
    @Param('id', ParseIntPipe) id: number, // 👉 Validación agregada
    @Body() updateRolDto: UpdateRolDto,
  ) {
    return this.rolService.update(id, updateRolDto);
  }

  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    // 👉 Validación agregada
    return this.rolService.remove(id);
  }
}
