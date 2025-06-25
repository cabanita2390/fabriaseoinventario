import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  ParseIntPipe, // ✅ Agregado para validación de tipo
} from '@nestjs/common';
import { UnidadmedidaService } from './unidadmedida.service';
import { CreateUnidadmedidaDto } from './dto/create-unidadmedida.dto';
import { UpdateUnidadmedidaDto } from './dto/update-unidadmedida.dto';

@Controller('unidadmedida')
export class UnidadmedidaController {
  constructor(private readonly unidadmedidaService: UnidadmedidaService) {}

  @Post()
  async create(@Body() createUnidadmedidaDto: CreateUnidadmedidaDto) {
    // ✅ async agregado
    return this.unidadmedidaService.create(createUnidadmedidaDto);
  }

  @Get()
  async findAll() {
    // ✅ async agregado
    return this.unidadmedidaService.findAll();
  }

  @Get(':id')
  async findOne(@Param('id', ParseIntPipe) id: number) {
    // ✅ Validación de tipo agregada
    return this.unidadmedidaService.findOne(id);
  }

  @Patch(':id')
  async update(
    @Param('id', ParseIntPipe) id: number, // ✅ Validación de tipo agregada
    @Body() updateUnidadmedidaDto: UpdateUnidadmedidaDto,
  ) {
    return this.unidadmedidaService.update(id, updateUnidadmedidaDto);
  }

  @Delete(':id')
  async remove(@Param('id', ParseIntPipe) id: number) {
    // ✅ Validación de tipo agregada
    return this.unidadmedidaService.remove(id);
  }
}
