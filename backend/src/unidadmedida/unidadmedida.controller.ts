import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import { UnidadmedidaService } from './unidadmedida.service';
import { CreateUnidadmedidaDto } from './dto/create-unidadmedida.dto';
import { UpdateUnidadmedidaDto } from './dto/update-unidadmedida.dto';

@Controller('unidadmedida')
export class UnidadmedidaController {
  constructor(private readonly unidadmedidaService: UnidadmedidaService) {}

  @Post()
  create(@Body() createUnidadmedidaDto: CreateUnidadmedidaDto) {
    return this.unidadmedidaService.create(createUnidadmedidaDto);
  }

  @Get()
  findAll() {
    return this.unidadmedidaService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.unidadmedidaService.findOne(+id);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateUnidadmedidaDto: UpdateUnidadmedidaDto,
  ) {
    return this.unidadmedidaService.update(+id, updateUnidadmedidaDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.unidadmedidaService.remove(+id);
  }
}
