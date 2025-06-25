import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  ParseIntPipe,
} from '@nestjs/common';
import { PresentacionService } from './presentacion.service';
import { CreatePresentacionDto } from './dto/create-presentacion.dto';
import { UpdatePresentacionDto } from './dto/update-presentacion.dto';

@Controller('presentacion')
export class PresentacionController {
  constructor(private readonly presentacionService: PresentacionService) {}

  @Post()
  async create(@Body() createPresentacionDto: CreatePresentacionDto) {
    return this.presentacionService.create(createPresentacionDto);
  }

  @Get()
  async findAll() {
    return this.presentacionService.findAll();
  }

  @Get(':id')
  async findOne(@Param('id', ParseIntPipe) id: number) {
    return this.presentacionService.findOne(id);
  }

  @Patch(':id')
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updatePresentacionDto: UpdatePresentacionDto,
  ) {
    return this.presentacionService.update(id, updatePresentacionDto);
  }

  @Delete(':id')
  async remove(@Param('id', ParseIntPipe) id: number) {
    return this.presentacionService.remove(id);
  }
}
