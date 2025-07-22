/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { Injectable, Logger, OnApplicationBootstrap } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Bodega } from 'src/entities/bodega.entity';
import { Presentacion } from 'src/entities/presentacion.entity';
import { Producto } from 'src/entities/producto.entity';
import { UnidadMedida } from 'src/entities/unidadmedida.entity';
import { Repository, DeepPartial, Not, IsNull } from 'typeorm'; // ✅ import Not y IsNull
import { defaultProductRows, DefaultProductRow } from './default_products_data';
import * as bcrypt from 'bcrypt'; // asegúrate de tener bcrypt instalado
import { Rol } from 'src/entities/rol.entity';
import { Usuario } from 'src/entities/usuario.entity';
import { TipoProducto } from 'src/producto/dto/create-producto.dto'; // ✅ import enum

interface SeedRow {
  PRODUCTO: string;
  PRESENTACION: string;
  TIPO_PRODUCTO: string;
}

@Injectable()
export class SeedService implements OnApplicationBootstrap {
  private readonly logger = new Logger(SeedService.name);

  private readonly rows: SeedRow[] = [
    /* ... tus datos actuales para materias primas ... */
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

  /** Crea todas las presentaciones únicas según defaultProductRows */
  private async seedPresentacionesPredeterminadas(): Promise<void> {
    this.logger.log('Sembrando presentaciones (TODOS los tipos)...');
    const presentacionesPorTipo = new Map<TipoProducto, Set<string>>();

    for (const row of defaultProductRows) {
      const tipoProducto = row.TIPO_PRODUCTO.trim() as TipoProducto;
      const nombre = row.PRESENTACION.trim();
      if (!presentacionesPorTipo.has(tipoProducto)) {
        presentacionesPorTipo.set(tipoProducto, new Set());
      }
      presentacionesPorTipo.get(tipoProducto)!.add(nombre);
    }

    for (const [tipoProducto, nombres] of presentacionesPorTipo.entries()) {
      for (const nombre of nombres) {
        let pres = await this.presRepo.findOne({
          where: { nombre, tipoProducto },
        });
        if (!pres) {
          pres = this.presRepo.create({ nombre, tipoProducto }); // ✅ tipoProducto explícito
          await this.presRepo.save(pres);
          this.logger.log(`Presentación creada: ${nombre} (${tipoProducto})`);
        }
      }
    }
  }

  async seedProductosPredeterminados(): Promise<{
    message: string;
    resumen: any;
  }> {
    try {
      this.logger.log('Iniciando seed de productos predeterminados...');

      const resumen: any = {
        productosCreados: 0,
        productosExistentes: 0,
        presentacionesCreadas: 0,
      };

      // 1. Agrupar presentaciones únicas por tipoProducto
      const presentacionesPorTipo = new Map<TipoProducto, Set<string>>(); // ✅ usar TipoProducto

      for (const row of defaultProductRows) {
        const tipoProducto = row.TIPO_PRODUCTO.trim() as TipoProducto; // ✅ cast
        const nombre = row.PRESENTACION.trim();

        if (!presentacionesPorTipo.has(tipoProducto)) {
          presentacionesPorTipo.set(tipoProducto, new Set());
        }
        presentacionesPorTipo.get(tipoProducto)!.add(nombre);
      }

      // 2. Crear presentaciones si no existen
      const presMap = new Map<string, Presentacion>();

      for (const [tipoProducto, nombres] of presentacionesPorTipo.entries()) {
        for (const nombre of nombres) {
          let pres = await this.presRepo.findOne({
            where: { nombre, tipoProducto }, // ✅ filtrar por tipoProducto
          });

          if (!pres) {
            pres = this.presRepo.create({
              nombre,
              tipoProducto, // ✅ se agrega tipoProducto
            });
            pres = await this.presRepo.save(pres);
            resumen.presentacionesCreadas++;
          }

          presMap.set(`${nombre}__${tipoProducto}`, pres);
        }
      }

      // 3. Asegurar unidad de medida
      const UMNOMBRE = 'KG';
      let um = await this.umRepo.findOne({ where: { nombre: UMNOMBRE } });
      if (!um) {
        um = this.umRepo.create({ nombre: UMNOMBRE });
        um = await this.umRepo.save(um);
      }

      // 4. Crear productos
      for (const row of defaultProductRows) {
        const nombre = row.PRODUCTO.trim();
        const tipoProducto = row.TIPO_PRODUCTO.trim() as TipoProducto; // ✅ cast

        const presKey = `${row.PRESENTACION.trim()}__${tipoProducto}`;
        const pres = presMap.get(presKey);
        if (!pres) {
          this.logger.warn(`Presentación no encontrada para: ${presKey}`);
          continue;
        }

        const prodExistente = await this.productoRepo.findOne({
          where: {
            nombre,
            tipoProducto,
            presentacion: { id: pres.id },
          },
          relations: ['presentacion'],
        });

        if (prodExistente) {
          resumen.productosExistentes++;
          this.logger.log(`Producto ya existe: ${nombre}`);
          continue;
        }

        const nuevo = this.productoRepo.create({
          nombre,
          tipoProducto,
          estado: 'ACTIVO',
          presentacion: pres,
          unidadMedida: um,
        });

        await this.productoRepo.save(nuevo);
        resumen.productosCreados++;
        this.logger.log(`Producto creado: ${nombre}`);
      }

      // 5. Actualizar secuencia de IDs
      await this.productoRepo.query(`
        SELECT setval(
          pg_get_serial_sequence('"producto"', 'idproducto'),
          (SELECT MAX(idproducto) FROM "producto")
        );
      `);

      // 6. Regenerar presentaciones desde productos existentes
      const resultadoPresentaciones =
        await this.regenerarPresentacionesDesdeProductos();
      resumen.presentacionesCreadas +=
        resultadoPresentaciones.presentacionesCreadas;

      return {
        message: 'Seed de productos predeterminados completado',
        resumen,
      };
    } catch (error) {
      this.logger.error('Error en seedProductosPredeterminados', error);
      throw error;
    }
  }

  async seedMateriasPrimas(): Promise<{ message: string; resumen: any }> {
    try {
      this.logger.log('Iniciando seed de materias primas...');

      const presentaciones = Array.from(
        new Set(this.rows.map((r) => r.PRESENTACION.trim())),
      );

      const presMap = new Map<string, Presentacion>();
      let presentacionesCreadas = 0;

      for (const nombre of presentaciones) {
        const tipo: TipoProducto = TipoProducto.MATERIA_PRIMA; // ✅ usar enum

        let pres = await this.presRepo.findOne({
          where: { nombre, tipoProducto: tipo },
        });
        if (!pres) {
          pres = this.presRepo.create({
            nombre,
            tipoProducto: tipo, // ✅ se agrega tipoProducto
          });
          pres = await this.presRepo.save(pres);
          presentacionesCreadas++;
        }
        presMap.set(nombre, pres);
      }

      const UMNOMBRE = 'KG';
      let um = await this.umRepo.findOne({ where: { nombre: UMNOMBRE } });
      if (!um) {
        um = this.umRepo.create({ nombre: UMNOMBRE });
        um = await this.umRepo.save(um);
      }

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
            tipoProducto: row.TIPO_PRODUCTO.trim() as TipoProducto, // ✅ cast
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

  async onApplicationBootstrap() {
    // 0. Primero siembra TODAS las presentaciones (de los 3 tipos),
    //    sin importar cuántos productos existan.
    await this.seedPresentacionesPredeterminadas();

    // 1. Ahora agrupamos por tipoProducto para sembrar productos si hacen falta
    const grouped: Record<TipoProducto, DefaultProductRow[]> = {
      [TipoProducto.MATERIA_PRIMA]: defaultProductRows.filter(
        // 🛑 evita el ESLint error casteando explícito:
        (p) => (p.TIPO_PRODUCTO as TipoProducto) === TipoProducto.MATERIA_PRIMA,
      ),
      [TipoProducto.MATERIAL_DE_ENVASE]: defaultProductRows.filter(
        (p) =>
          (p.TIPO_PRODUCTO as TipoProducto) === TipoProducto.MATERIAL_DE_ENVASE,
      ),
      [TipoProducto.ETIQUETAS]: defaultProductRows.filter(
        (p) => (p.TIPO_PRODUCTO as TipoProducto) === TipoProducto.ETIQUETAS,
      ),
    };

    for (const [tipo, rows] of Object.entries(grouped) as [
      TipoProducto,
      DefaultProductRow[],
    ][]) {
      const count = await this.productoRepo.count({
        where: { tipoProducto: tipo },
      });

      if (count < rows.length) {
        this.logger.log(
          `Iniciando seed de PRODUCTOS para ${tipo}: existentes ${count} / requeridos ${rows.length}`,
        );
        await this.seedProductosPorTipo(rows);
      } else {
        this.logger.log(
          `Seed omitido de PRODUCTOS para ${tipo}: ya existen ${count} productos`,
        );
      }
    }

    await this.seedBodegas();
    await this.seedRolesYAdmin();
  }

  private async seedProductosPorTipo(rows: DefaultProductRow[]) {
    const combinacionesUnicas = new Map<
      string,
      { nombre: string; tipoProducto: TipoProducto }
    >();

    for (const row of rows) {
      const nombre = row.PRESENTACION.trim();
      const tipo = row.TIPO_PRODUCTO.trim() as TipoProducto;
      const key = `${nombre}__${tipo}`;
      combinacionesUnicas.set(key, { nombre, tipoProducto: tipo });
    }

    const presMap = new Map<string, Presentacion>();

    for (const [
      key,
      { nombre, tipoProducto },
    ] of combinacionesUnicas.entries()) {
      let pres = await this.presRepo.findOne({
        where: { nombre, tipoProducto },
      });
      if (!pres) {
        pres = this.presRepo.create({
          nombre,
          tipoProducto, // ✅ se agrega tipoProducto
        });
        pres = await this.presRepo.save(pres);
      }
      presMap.set(key, pres);
    }

    for (const row of rows) {
      const nombreProducto = row.PRODUCTO.trim();
      const tipo = row.TIPO_PRODUCTO.trim() as TipoProducto;
      const key = `${row.PRESENTACION.trim()}__${tipo}`;
      const presentacion = presMap.get(key);

      const unidad = await this.obtenerOUcrearUM(row.UNIDADES || 'KG');

      const yaExiste = await this.productoRepo.findOne({
        where: {
          nombre: nombreProducto,
          tipoProducto: tipo,
          presentacion: { nombre: presentacion?.nombre },
        },
      });

      if (!yaExiste) {
        const producto = this.productoRepo.create({
          nombre: nombreProducto,
          tipoProducto: tipo,
          estado: 'ACTIVO',
          presentacion,
          unidadMedida: unidad,
        });
        await this.productoRepo.save(producto);
        this.logger.log(
          `Producto creado: ${nombreProducto} (${row.PRESENTACION})`,
        );
      } else {
        this.logger.log(
          `Producto ya existe: ${nombreProducto} (${row.PRESENTACION})`,
        );
      }
    }

    await this.productoRepo.query(`
      SELECT setval(
        pg_get_serial_sequence('"producto"', 'idproducto'),
        (SELECT MAX(idproducto) FROM "producto")
      );
    `);
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
      const existente = await this.rolRepo.findOne({ where: { nombre } });

      if (existente) {
        resumen.rolesExistentes++;
        this.logger.log(`Rol ya existe: ${nombre}`);
        rolMap.set(nombre, existente);
      } else {
        const nuevo = this.rolRepo.create({ nombre });
        const rol = await this.rolRepo.save(nuevo);
        resumen.rolesCreados++;
        this.logger.log(`Rol creado: ${nombre}`);
        rolMap.set(nombre, rol);
      }
    }

    const adminUsername = 'admin';
    const adminCorreo = 'admin@sistema.com';

    let admin = await this.usuarioRepo.findOne({
      where: { username: adminUsername },
    });

    if (!admin) {
      const adminPassword = 'Secreto456*';
      const hashed = await bcrypt.hash(adminPassword, 10);

      const rolAdmin = rolMap.get('ADMIN');
      if (!rolAdmin) {
        throw new Error(
          'No se encontró el rol ADMIN para asignar al usuario admin',
        );
      }

      admin = this.usuarioRepo.create({
        username: adminUsername,
        nombre: 'Administrador',
        email: adminCorreo,
        password: hashed,
        rol: rolAdmin,
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

  private async obtenerOUcrearUM(nombre: string): Promise<UnidadMedida> {
    const normalized = nombre.trim().toUpperCase();
    let um = await this.umRepo.findOne({ where: { nombre: normalized } });
    if (!um) {
      um = this.umRepo.create({ nombre: normalized });
      um = await this.umRepo.save(um);
    }
    return um;
  }

  async regenerarPresentacionesDesdeProductos(): Promise<{
    presentacionesCreadas: number;
  }> {
    this.logger.log('Regenerando presentaciones desde productos...');

    const productos = await this.productoRepo.find({
      relations: ['presentacion'],
      where: { presentacion: { id: Not(IsNull()) } },
    });

    const combinaciones = new Map<
      string,
      { nombre: string; tipoProducto: TipoProducto }
    >();
    let presentacionesCreadas = 0;

    for (const prod of productos) {
      const pres = prod.presentacion;
      const tipo = prod.tipoProducto;
      if (!pres || !pres.nombre || !tipo) {
        this.logger.warn(`Producto con datos incompletos: ${prod.nombre}`);
        continue;
      }
      const key = `${pres.nombre.trim().toUpperCase()}|${tipo}`;
      if (!combinaciones.has(key)) {
        combinaciones.set(key, {
          nombre: pres.nombre.trim(),
          tipoProducto: tipo,
        });
      }
    }

    for (const { nombre, tipoProducto } of combinaciones.values()) {
      const yaExiste = await this.presRepo.findOne({
        where: { nombre, tipoProducto },
      });
      if (!yaExiste) {
        await this.presRepo.save(
          this.presRepo.create({
            nombre,
            tipoProducto, // ✅ se agrega tipoProducto
          }),
        );
        presentacionesCreadas++;
        this.logger.log(`Presentación creada: ${nombre} (${tipoProducto})`);
      } else {
        this.logger.log(`Presentación ya existe: ${nombre} (${tipoProducto})`);
      }
    }

    return { presentacionesCreadas };
  }
}
