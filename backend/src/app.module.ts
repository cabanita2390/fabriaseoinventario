/* eslint-disable prettier/prettier */
import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule, ConfigService  } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PresentacionModule } from './presentacion/presentacion.module';
import { UnidadmedidaModule } from './unidadmedida/unidadmedida.module';
import { ProveedorModule } from './proveedor/proveedor.module';
import { BodegaModule } from './bodega/bodega.module';
import { InventarioModule } from './inventario/inventario.module';
import { MovimientoModule } from './movimiento/movimiento.module';
import { UsuarioModule } from './usuario/usuario.module';
import { RolModule } from './rol/rol.module';
import { ProductoModule } from './producto/producto.module';
import { DashboardModule } from './dashboard/dashboard.module';
import { AuthModule } from './auth/auth.module';

@Module({
  imports: [
    
    // 1) Cargar el módulo de configuración
    ConfigModule.forRoot({ isGlobal: true }),

    // 2) Configurar TypeORM de forma asíncrona
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        type: 'postgres',
        host: config.get<string>('DB_HOST'),
        port: config.get<number>('DB_PORT'),      // ConfigService convierte a number si tu .env declara DB_PORT=5432
        username: config.get<string>('DB_USER'),
        password: config.get<string>('DB_PASS'),
        database: config.get<string>('DB_NAME'),
        autoLoadEntities: true,
        synchronize: true, // solo en desarrollo
        dropSchema: true, 
      }),
    }),

    PresentacionModule,

    UnidadmedidaModule,

    ProveedorModule,

    BodegaModule,

    InventarioModule,

    MovimientoModule,

    UsuarioModule,

    RolModule,

    ProductoModule,

    DashboardModule,

    AuthModule,
  
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
