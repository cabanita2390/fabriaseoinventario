/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Bodega } from 'src/entities/bodega.entity';
import { Presentacion } from 'src/entities/presentacion.entity';
import { Producto } from 'src/entities/producto.entity';
import { UnidadMedida } from 'src/entities/unidadmedida.entity';
import { Repository, DeepPartial } from 'typeorm';
import { defaultProductRows } from './default_products_data';
import * as bcrypt from 'bcrypt';
import { Rol } from 'src/entities/rol.entity';
import { Usuario } from 'src/entities/usuario.entity';

interface SeedRow {
  PRODUCTO: string;
  PRESENTACION: string;
  TIPO_PRODUCTO: string;
}

@Injectable()
export class SeedService {
  private readonly logger = new Logger(SeedService.name);

  // JSON con materias primas
  private readonly rows: SeedRow[] = [
    /* ... tus datos actuales ... */
  ];

  constructor(
    @InjectRepository(Presentacion)
    private readonly presRepo: Repository<Presentacion>,

    @InjectRepository(UnidadMedida)
    private readonly umRepo: Repository<UnidadMedida>,

    @InjectRepository(Producto)
    private readonly productoRepo: Repository<Producto>,

    @InjectRepository(Bodega)
    private readonly bodegaRepo: Repository<Bodega>,

    @InjectRepository(Rol)
    private readonly rolRepo: Repository<Rol>,

    @InjectRepository(Usuario)
    private readonly usuarioRepo: Repository<Usuario>,
  ) {}

  async seedMateriasPrimas(): Promise<{ message: string; resumen: any }> {
    try {
      this.logger.log('Iniciando seed de materias primas...');

      // 1) Upsert Presentaciones
      const presentaciones = Array.from(
        new Set(this.rows.map((r) => r.PRESENTACION.trim())),
      );

      const presMap = new Map<string, Presentacion>();
      let presentacionesCreadas = 0;

      for (const nombre of presentaciones) {
        let pres = await this.presRepo.findOne({ where: { nombre } });
        if (!pres) {
          pres = this.presRepo.create({ nombre });
          pres = await this.presRepo.save(pres);
          presentacionesCreadas++;
        }
        presMap.set(nombre, pres);
      }

      // 2) Upsert Unidad de Medida "KG"
      const UMNOMBRE = 'KG';
      let um = await this.umRepo.findOne({ where: { nombre: UMNOMBRE } });
      if (!um) {
        um = this.umRepo.create({ nombre: UMNOMBRE });
        um = await this.umRepo.save(um);
      }

      // 3) Eliminar duplicados de productos
      const uniqueRows = Array.from(
        new Map(
          this.rows.map((r) => [r.PRODUCTO.trim().toUpperCase(), r]),
        ).values(),
      );

      let productosCreados = 0;
      let productosExistentes = 0;

      for (const row of uniqueRows) {
        const pres = presMap.get(row.PRESENTACION.trim());
        if (!pres) continue;

        let prod = await this.productoRepo.findOne({
          where: { nombre: row.PRODUCTO },
        });

        if (!prod) {
          const ent = this.productoRepo.create({
            nombre: row.PRODUCTO,
            tipoProducto: row.TIPO_PRODUCTO,
            subtipoInsumo: undefined,
            estado: 'ACTIVO',
            presentacion: pres,
            unidadMedida: um,
            proveedor: undefined,
          } as DeepPartial<Producto>);

          prod = await this.productoRepo.save(ent);
          productosCreados++;
          this.logger.log(`Producto creado: ${row.PRODUCTO}`);
        } else {
          productosExistentes++;
          this.logger.log(`Producto ya existe: ${row.PRODUCTO}`);
        }
      }

      // 4) Actualizar el autoincremento
      await this.productoRepo.query(`
        SELECT setval(
          pg_get_serial_sequence('"producto"', 'idproducto'),
          (SELECT MAX(idproducto) FROM "producto")
        );
      `);

      return {
        message: 'Seed de Materias Primas completado',
        resumen: {
          productosCreados,
          productosExistentes,
          presentacionesCreadas,
        },
      };
    } catch (error) {
      this.logger.error('Error en seedMateriasPrimas', error);
      throw error;
    }
  }

  async seedBodegas(): Promise<{ message: string; resumen: any }> {
    try {
      this.logger.log('Iniciando seed de bodegas...');

      const bodegas = [
        { nombre: 'Bodega Fabriaseo', ubicacion: 'Calle 1 no 25-46, Sogamoso' },
        { nombre: 'Bodega 2' },
      ];

      let bodegasCreadas = 0;
      let bodegasExistentes = 0;

      for (const { nombre, ubicacion } of bodegas) {
        let bodega = await this.bodegaRepo.findOne({ where: { nombre } });
        if (!bodega) {
          bodega = this.bodegaRepo.create({ nombre, ubicacion });
          await this.bodegaRepo.save(bodega);
          bodegasCreadas++;
          this.logger.log(`Bodega creada: ${nombre}`);
        } else {
          bodegasExistentes++;
          this.logger.log(`Bodega ya existe: ${nombre}`);
        }
      }

      return {
        message: 'Seed de Bodegas completado',
        resumen: { bodegasCreadas, bodegasExistentes },
      };
    } catch (error) {
      this.logger.error('Error en seedBodegas', error);
      throw error;
    }
  }

  async seedProductosPredeterminados(): Promise<{
    message: string;
    resumen: any;
  }> {
    try {
      this.logger.log('Iniciando seed de productos predeterminados...');

      const presentaciones = Array.from(
        new Set(defaultProductRows.map((r) => r.PRESENTACION.trim())),
      );

      const presMap = new Map<string, Presentacion>();
      let presentacionesCreadas = 0;

      for (const nombre of presentaciones) {
        let pres = await this.presRepo.findOne({ where: { nombre } });
        if (!pres) {
          pres = this.presRepo.create({ nombre });
          pres = await this.presRepo.save(pres);
          presentacionesCreadas++;
        }
        presMap.set(nombre, pres);
      }

      // Asegurar unidad de medida KG
      const UMNOMBRE = 'KG';
      let um = await this.umRepo.findOne({ where: { nombre: UMNOMBRE } });
      if (!um) {
        um = this.umRepo.create({ nombre: UMNOMBRE });
        um = await this.umRepo.save(um);
      }

      let productosCreados = 0;
      let productosExistentes = 0;

      for (const row of defaultProductRows) {
        const pres = presMap.get(row.PRESENTACION.trim());
        if (!pres) continue;

        let prod = await this.productoRepo.findOne({
          where: { nombre: row.PRODUCTO },
        });

        if (!prod) {
          const nuevo = this.productoRepo.create({
            nombre: row.PRODUCTO,
            tipoProducto: row.TIPO_PRODUCTO,
            subtipoInsumo: undefined,
            estado: 'ACTIVO',
            presentacion: pres,
            unidadMedida: um,
            proveedor: undefined,
          } as DeepPartial<Producto>);
          prod = await this.productoRepo.save(nuevo);
          productosCreados++;
          this.logger.log(`Producto creado: ${row.PRODUCTO}`);
        } else {
          productosExistentes++;
          this.logger.log(`Producto ya existe: ${row.PRODUCTO}`);
        }
      }

      await this.productoRepo.query(`
      SELECT setval(
        pg_get_serial_sequence('"producto"', 'idproducto'),
        (SELECT MAX(idproducto) FROM "producto")
      );
    `);

      return {
        message: 'Seed de productos predeterminados completado',
        resumen: {
          productosCreados,
          productosExistentes,
          presentacionesCreadas,
        },
      };
    } catch (error) {
      this.logger.error('Error en seedProductosPredeterminados', error);
      throw error;
    }
  }

  async seedRolesYAdmin(): Promise<{ message: string; resumen: any }> {
    this.logger.log('Iniciando seed de roles y usuario admin...');

    const rolesIniciales = [
      'ADMIN',
      'LIDER_PRODUCCION',
      'RECEPTOR_MP',
      'RECEPTOR_ENVASE',
      'RECEPTOR_ETIQUETAS',
      'USUARIO',
    ];

    const resumen = {
      rolesCreados: 0,
      rolesExistentes: 0,
      adminCreado: false,
      adminExistente: false,
    };

    const rolMap = new Map<string, Rol>();

    for (const nombre of rolesIniciales) {
      let rol = await this.rolRepo.findOne({ where: { nombre } });
      if (!rol) {
        rol = this.rolRepo.create({ nombre });
        rol = await this.rolRepo.save(rol);
        resumen.rolesCreados++;
        this.logger.log(`Rol creado: ${nombre}`);
      } else {
        resumen.rolesExistentes++;
        this.logger.log(`Rol ya existe: ${nombre}`);
      }
      rolMap.set(nombre, rol);
    }

    // Verificar si ya existe el admin (por username)
    const adminUsername = 'admin';
    const adminCorreo = 'admin@sistema.com';

    let admin = await this.usuarioRepo.findOne({
      where: { username: adminUsername },
    });

    if (!admin) {
      const adminPassword = 'Admin123*'; // Cambia esto solo si deseas una clave distinta
      const hashed = await bcrypt.hash(adminPassword, 10);

      admin = this.usuarioRepo.create({
        username: adminUsername,
        nombre: 'Administrador',
        email: adminCorreo,
        password: hashed,
        rol: rolMap.get('ADMIN'),
      });

      await this.usuarioRepo.save(admin);
      resumen.adminCreado = true;
      this.logger.log(`Usuario admin creado con username: ${adminUsername}`);
    } else {
      resumen.adminExistente = true;
      this.logger.log(`Usuario admin ya existe: ${adminUsername}`);
    }

    return {
      message: 'Seed de roles y admin completado',
      resumen,
    };
  }
}
