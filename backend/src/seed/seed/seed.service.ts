/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { Injectable, Logger, OnApplicationBootstrap } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Bodega } from 'src/entities/bodega.entity';
import { Presentacion } from 'src/entities/presentacion.entity';
import { Producto } from 'src/entities/producto.entity';
import { UnidadMedida } from 'src/entities/unidadmedida.entity';
import { Repository, DeepPartial, Not, IsNull } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { Rol } from 'src/entities/rol.entity';
import { Usuario } from 'src/entities/usuario.entity';
import { TipoProducto } from 'src/producto/dto/create-producto.dto'; // Importa el enum

// Importa los datos de los nuevos archivos
import { materiaPrimaData } from './materia_prima_data';
import { materialEnvaseData } from './material_envase_data';
import { etiquetasData } from './etiquetas_data';

// Define la interfaz para las filas de datos de los productos
interface DefaultProductRow {
  PRODUCTO: string;
  PRESENTACION: string;
  UNIDADES: string; // Se agregó la propiedad UNIDADES
  TIPO_PRODUCTO: string;
}

@Injectable()
export class SeedService implements OnApplicationBootstrap {
  private readonly logger = new Logger(SeedService.name);

  // Combina todos los datos de los diferentes archivos en una sola colección
  private readonly allProductRows: DefaultProductRow[] = [
    ...materiaPrimaData,
    ...materialEnvaseData,
    ...etiquetasData,
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

  /** Crea todas las presentaciones únicas según allProductRows */
  private async seedPresentacionesPredeterminadas(): Promise<void> {
    this.logger.log('Sembrando presentaciones (TODOS los tipos)...');

    // Usamos un Set para almacenar combinaciones únicas de PRESENTACION y TIPO_PRODUCTO
    const uniquePresentations = new Set<string>();
    for (const row of this.allProductRows) {
      const nombre = row.PRESENTACION.trim();
      const tipo = row.TIPO_PRODUCTO.trim();
      uniquePresentations.add(`${nombre}__${tipo}`); // Almacenamos la combinación única
    }

    // Iteramos sobre las combinaciones únicas para crear o verificar presentaciones
    for (const combo of uniquePresentations) {
      const [nombre, tipoStr] = combo.split('__');
      const tipoProducto = tipoStr as TipoProducto;

      // Buscar por nombre Y tipoProducto para asegurar unicidad
      let pres = await this.presRepo.findOne({ where: { nombre, tipoProducto } });

      if (!pres) {
        // Si no existe la combinación (nombre, tipoProducto), la creamos
        pres = this.presRepo.create({ nombre, tipoProducto });
        await this.presRepo.save(pres);
        this.logger.log(`Presentación creada: ${nombre} (${tipoProducto})`);
      } else {
        // Si ya existe, no hacemos nada, ya que es la combinación correcta
        this.logger.log(`Presentación ya existe: ${nombre} (${tipoProducto})`);
      }
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
      [TipoProducto.MATERIA_PRIMA]: this.allProductRows.filter(
        (p) => (p.TIPO_PRODUCTO as TipoProducto) === TipoProducto.MATERIA_PRIMA,
      ),
      [TipoProducto.MATERIAL_DE_ENVASE]: this.allProductRows.filter(
        (p) =>
          (p.TIPO_PRODUCTO as TipoProducto) === TipoProducto.MATERIAL_DE_ENVASE,
      ),
      [TipoProducto.ETIQUETAS]: this.allProductRows.filter(
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
    const presMap = new Map<string, Presentacion>();

    for (const row of rows) {
      const nombre = row.PRESENTACION.trim();
      const tipo = row.TIPO_PRODUCTO.trim() as TipoProducto;
      const key = `${nombre}__${tipo}`;
      const pres = await this.presRepo.findOne({
        where: { nombre, tipoProducto: tipo },
      });
      if (pres) {
        presMap.set(key, pres);
      } else {
        this.logger.warn(`Presentación no encontrada (después de seedPresentacionesPredeterminadas): ${nombre} (${tipo})`);
        const newPres = this.presRepo.create({ nombre, tipoProducto: tipo });
        await this.presRepo.save(newPres);
        presMap.set(key, newPres);
      }
    }

    const productosToSave: Producto[] = [];
    for (const row of rows) {
      const nombreProducto = row.PRODUCTO.trim();
      const tipo = row.TIPO_PRODUCTO.trim() as TipoProducto;
      const key = `${row.PRESENTACION.trim()}__${tipo}`;
      const presentacion = presMap.get(key);

      if (!presentacion) {
        this.logger.error(`Error crítico: Presentación "${row.PRESENTACION.trim()} (${tipo})" no encontrada para producto "${nombreProducto}". Saltando este producto.`);
        continue;
      }

      const unidad = await this.obtenerOUcrearUM(row.UNIDADES || 'UNIDAD');

      const yaExiste = await this.productoRepo.findOne({
        where: {
          nombre: nombreProducto,
          tipoProducto: tipo,
          presentacion: { id: presentacion.id },
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
        productosToSave.push(producto);
        this.logger.log(
          `Producto preparado para creación: ${nombreProducto} (${row.PRESENTACION})`,
        );
      } else {
        this.logger.log(
          `Producto ya existe: ${nombreProducto} (${row.PRESENTACION})`,
        );
      }
    }

    // INICIO DEL CAMBIO: Guardado por lotes
    const BATCH_SIZE = 500; // Define el tamaño del lote. Puedes ajustarlo según el rendimiento.
    if (productosToSave.length > 0) {
      this.logger.log(`Iniciando guardado de ${productosToSave.length} productos en lotes de ${BATCH_SIZE}...`);
      for (let i = 0; i < productosToSave.length; i += BATCH_SIZE) {
        const batch = productosToSave.slice(i, i + BATCH_SIZE);
        await this.productoRepo.save(batch);
        this.logger.log(`Lote de ${batch.length} productos guardado. Total procesado: ${i + batch.length}`);
      }
      this.logger.log('Todos los productos nuevos guardados exitosamente.');
    }
    // FIN DEL CAMBIO: Guardado por lotes


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
      // Buscar por nombre Y tipoProducto para asegurar unicidad
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
