// src/bodega/bodega.controller.ts
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
import { BodegaService } from './bodega.service';
import { CreateBodegaDto } from './dto/create-bodega.dto';
import { UpdateBodegaDto } from './dto/update-bodega.dto';
import { Roles } from 'src/auth/decorators/roles.decorator';
import {  ADMIN,  RECEPTOR_MP,LIDER_PRODUCCION,OPERARIO_PRODUCCION,RECEPTOR_ENVASE,RECEPTOR_ETIQUETAS} from 'src/auth/constants/roles.constant';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { RolesGuard } from 'src/auth/guards/roles.guard';

@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('bodega')
export class BodegaController {
  constructor(private readonly bodegaService: BodegaService) {}

  @Post()
  @Roles(ADMIN)
  create(@Body() createBodegaDto: CreateBodegaDto) {
    return this.bodegaService.create(createBodegaDto);
  }

  @Get()
  @Roles(ADMIN,  RECEPTOR_MP,LIDER_PRODUCCION,OPERARIO_PRODUCCION,RECEPTOR_ENVASE,RECEPTOR_ETIQUETAS)
  findAll() {
    return this.bodegaService.findAll();
  }

  @Get('all')
  findAllNames() {
    return this.bodegaService.findAllNames();
  }

  @Get(':id')
  @Roles(ADMIN)
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.bodegaService.findOne(id);
  }

  @Patch(':id')
  @Roles(ADMIN)
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateBodegaDto: UpdateBodegaDto,
  ) {
    return this.bodegaService.update(id, updateBodegaDto);
  }

  @Delete(':id')
  @Roles(ADMIN)
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.bodegaService.remove(id);
  }
}
