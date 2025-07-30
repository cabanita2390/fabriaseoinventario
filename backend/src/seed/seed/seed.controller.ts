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

  // El método seedMateriasPrimas() y seedProductosPredeterminados()
  // fueron eliminados del SeedService.
  // La siembra de productos (materias primas, envases, etiquetas)
  // ahora se maneja automáticamente en el método onApplicationBootstrap
  // del SeedService al iniciar la aplicación.
  // Si necesitas forzar una siembra completa, considera crear un método
  // público en SeedService para ese propósito.

  @Post('bodegas')
  async seedBodegas(): Promise<{ message: string; resumen: any }> {
    // Este método aún existe en SeedService y puede ser llamado.
    return this.seedService.seedBodegas();
  }

  // Si deseas un endpoint para sembrar roles y el usuario admin,
  // puedes añadirlo de la siguiente manera:
  @Post('roles-admin')
  async seedRolesAndAdmin(): Promise<{ message: string; resumen: any }> {
    return this.seedService.seedRolesYAdmin();
  }
}
