// src/seed/seed.controller.ts
import { Controller, Post } from '@nestjs/common';
import { SeedService } from './seed.service';

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
