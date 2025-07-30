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
import { PresentacionService } from './presentacion.service';
import { CreatePresentacionDto } from './dto/create-presentacion.dto';
import { UpdatePresentacionDto } from './dto/update-presentacion.dto';
import { Roles } from 'src/auth/decorators/roles.decorator';
import { ADMIN } from 'src/auth/constants/roles.constant';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { RolesGuard } from 'src/auth/guards/roles.guard';

@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('presentacion')
export class PresentacionController {
  constructor(private readonly presentacionService: PresentacionService) {}

  @Post()
  @Roles(ADMIN)
  async create(@Body() dto: CreatePresentacionDto) {
    return this.presentacionService.create(dto);
  }

  @Get()
  @Roles(ADMIN)
  async findAll() {
    return this.presentacionService.findAll();
  }

  @Get(':id')
  @Roles(ADMIN)
  async findOne(@Param('id', ParseIntPipe) id: number) {
    return this.presentacionService.findOne(id);
  }

  @Patch(':id')
  @Roles(ADMIN)
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updatePresentacionDto: UpdatePresentacionDto,
  ) {
    return this.presentacionService.update(id, updatePresentacionDto);
  }

  @Delete(':id')
  @Roles(ADMIN)
  async remove(@Param('id', ParseIntPipe) id: number) {
    return this.presentacionService.remove(id);
  }
}
