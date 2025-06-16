// src/seed/seed.controller.ts
import { Controller, Post } from '@nestjs/common';
import { SeedService } from './seed.service';

@Controller('seed')
export class SeedController {
  constructor(private readonly seedService: SeedService) {}

  @Post('materiaprima')
  async seedMateriasPrimas() {
    return this.seedService.seedMateriasPrimas();
  }

  @Post('bodegas')
  async seedBodegas() {
    return this.seedService.seedBodegas();
  }
}
