// src/seed/seed.controller.ts
import { Controller, Post, UseGuards } from '@nestjs/common';
import { SeedService } from './seed.service';
import { Roles } from 'src/auth/decorators/roles.decorator';
import { ADMIN } from 'src/auth/constants/roles.constant';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { RolesGuard } from 'src/auth/guards/roles.guard';

@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(ADMIN)
@Controller('seed')
export class SeedController {
  constructor(private readonly seedService: SeedService) {}

  @Post('materiaprima')
  async seedMateriasPrimas(): Promise<{ message: string; resumen: any }> {
    // 👉 Tipado agregado
    return this.seedService.seedMateriasPrimas();
  }

  @Post('bodegas')
  async seedBodegas(): Promise<{ message: string; resumen: any }> {
    // 👉 Tipado agregado
    return this.seedService.seedBodegas();
  }
}
