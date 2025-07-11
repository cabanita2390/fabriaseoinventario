/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Bodega } from 'src/entities/bodega.entity';
import { Presentacion } from 'src/entities/presentacion.entity';
import { Producto } from 'src/entities/producto.entity';
import { UnidadMedida } from 'src/entities/unidadmedida.entity';
import { Repository, DeepPartial } from 'typeorm';

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

  async onApplicationBootstrap() {
    const grouped = {
      MATERIA_PRIMA: defaultProductRows.filter(
        (p) => p.TIPO_PRODUCTO === 'MATERIA_PRIMA',
      ),
      MATERIAL_DE_ENVASE: defaultProductRows.filter(
        (p) => p.TIPO_PRODUCTO === 'MATERIAL_DE_ENVASE',
      ),
      ETIQUETAS: defaultProductRows.filter(
        (p) => p.TIPO_PRODUCTO === 'ETIQUETAS',
      ),
    };

    for (const [tipo, rows] of Object.entries(grouped) as [
      'MATERIA_PRIMA' | 'MATERIAL_DE_ENVASE' | 'ETIQUETAS',
      DefaultProductRow[],
    ][]) {
      const count = await this.productoRepo.count({
        where: { tipoProducto: tipo },
      });

      if (count < rows.length) {
        this.logger.log(
          `Iniciando seed para ${tipo}: existentes ${count} / requeridos ${rows.length}`,
        );
        await this.seedProductosPorTipo(rows);
      } else {
        this.logger.log(
          `Seed omitido para ${tipo}: ya existen ${count} productos`,
        );
      }
    }

    await this.seedBodegas();
    await this.seedRolesYAdmin();

  }

  private async seedProductosPorTipo(rows: DefaultProductRow[]) {
    // Crear un mapa de combinaciones únicas de presentacion + tipo
    const combinacionesUnicas = new Map<
      string,
      { nombre: string; tipoProducto: Producto['tipoProducto'] }
    >();

    for (const row of rows) {
      const nombre = row.PRESENTACION.trim();
      const tipo = row.TIPO_PRODUCTO.trim() as Producto['tipoProducto'];
      const key = `${nombre}__${tipo}`;
      combinacionesUnicas.set(key, { nombre, tipoProducto: tipo });
    }

    // Crear las presentaciones si no existen
    const presMap = new Map<string, Presentacion>();

    for (const [
      key,
      { nombre, tipoProducto },
    ] of combinacionesUnicas.entries()) {
      let pres = await this.presRepo.findOne({
        where: { nombre, tipoProducto },
      });
      if (!pres) {
        pres = this.presRepo.create({ nombre, tipoProducto });
        pres = await this.presRepo.save(pres);
      }
      presMap.set(key, pres);
    }

    // Crear productos
    for (const row of rows) {
      const nombreProducto = row.PRODUCTO.trim();
      const tipo = row.TIPO_PRODUCTO.trim() as Producto['tipoProducto'];
      const nombrePres = row.PRESENTACION.trim();
      const key = `${nombrePres}__${tipo}`;
      const presentacion = presMap.get(key);

      const unidad = await this.obtenerOUcrearUM(row.UNIDADES || 'KG');

      const yaExiste = await this.productoRepo.findOne({
        where: {
          nombre: nombreProducto,
          tipoProducto: tipo,
          presentacion: {
            nombre: presentacion?.nombre,
          },
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

    // Actualizar secuencia
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
      const adminPassword = 'Secreto456*'; // Cambia esto solo si deseas una clave distinta
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
      where: {
        presentacion: {
          id: Not(IsNull()),
        },
      },
    });

    const combinaciones = new Map<
      string,
      {
        nombre: string;
        tipoProducto: 'MATERIA_PRIMA' | 'MATERIAL_DE_ENVASE' | 'ETIQUETAS';
      }
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
            tipoProducto,
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
