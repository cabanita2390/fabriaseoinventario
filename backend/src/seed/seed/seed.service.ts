/* eslint-disable @typescript-eslint/no-unsafe-assignment */
// src/seed/seed.service.ts
import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
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

  // 1. Tu JSON de materias primas
  private readonly rows: SeedRow[] = [
    {
      PRODUCTO: 'TGL',
      PRESENTACION: 'CANECA X 210 KG',
      TIPO_PRODUCTO: 'MATERIA_PRIMA',
    },
    {
      PRODUCTO: 'ROH96',
      PRESENTACION: 'CANECA X 200 KG',
      TIPO_PRODUCTO: 'MATERIA_PRIMA',
    },
    {
      PRODUCTO: 'BTX',
      PRESENTACION: 'CANECA X 200 KG',
      TIPO_PRODUCTO: 'MATERIA_PRIMA',
    },
    {
      PRODUCTO: 'TTM',
      PRESENTACION: 'CANECA X 270 KG',
      TIPO_PRODUCTO: 'MATERIA_PRIMA',
    },
    {
      PRODUCTO: 'SBTG',
      PRESENTACION: 'CANECA X 270 KG',
      TIPO_PRODUCTO: 'MATERIA_PRIMA',
    },
    {
      PRODUCTO: 'FOAM',
      PRESENTACION: 'CANECA X 200 KG',
      TIPO_PRODUCTO: 'MATERIA_PRIMA',
    },
    {
      PRODUCTO: 'PRD',
      PRESENTACION: 'CANECA X 200 KG',
      TIPO_PRODUCTO: 'MATERIA_PRIMA',
    },
    {
      PRODUCTO: 'BKC',
      PRESENTACION: 'CANECA X 20 KG',
      TIPO_PRODUCTO: 'MATERIA_PRIMA',
    },
    {
      PRODUCTO: 'NTP10',
      PRESENTACION: 'CANECA X 200 KG',
      TIPO_PRODUCTO: 'MATERIA_PRIMA',
    },
    {
      PRODUCTO: 'LABS',
      PRESENTACION: 'CANECA X 200 KG',
      TIPO_PRODUCTO: 'MATERIA_PRIMA',
    },
    {
      PRODUCTO: 'USPG',
      PRESENTACION: 'CANECA X 200 KG',
      TIPO_PRODUCTO: 'MATERIA_PRIMA',
    },
    {
      PRODUCTO: 'EMC',
      PRESENTACION: 'CANECA X 200 KG',
      TIPO_PRODUCTO: 'MATERIA_PRIMA',
    },
    {
      PRODUCTO: 'SELP',
      PRESENTACION: 'CANECA X 200 KG',
      TIPO_PRODUCTO: 'MATERIA_PRIMA',
    },
    {
      PRODUCTO: 'PRF',
      PRESENTACION: 'CANECA X 25 KG',
      TIPO_PRODUCTO: 'MATERIA_PRIMA',
    },
    {
      PRODUCTO: 'CBM',
      PRESENTACION: 'CANECA X 20 KG',
      TIPO_PRODUCTO: 'MATERIA_PRIMA',
    },
    {
      PRODUCTO: 'CRT',
      PRESENTACION: 'CANECA X 200 KG',
      TIPO_PRODUCTO: 'MATERIA_PRIMA',
    },
    {
      PRODUCTO: 'VD4',
      PRESENTACION: 'CANECA X 55 GL O 220 K',
      TIPO_PRODUCTO: 'MATERIA_PRIMA',
    },
    {
      PRODUCTO: 'NAH15',
      PRESENTACION: 'CANECA X 25 KG',
      TIPO_PRODUCTO: 'MATERIA_PRIMA',
    },
    {
      PRODUCTO: 'NOH5',
      PRESENTACION: 'CANECA X 250 KG',
      TIPO_PRODUCTO: 'MATERIA_PRIMA',
    },
    {
      PRODUCTO: 'HOP5',
      PRESENTACION: 'CANECA X 33 KG',
      TIPO_PRODUCTO: 'MATERIA_PRIMA',
    },
    {
      PRODUCTO: 'FC340',
      PRESENTACION: 'CANECA X 20 KG',
      TIPO_PRODUCTO: 'MATERIA_PRIMA',
    },
    {
      PRODUCTO: 'FB136',
      PRESENTACION: 'CANECA X 20 KG',
      TIPO_PRODUCTO: 'MATERIA_PRIMA',
    },
    {
      PRODUCTO: 'FMZN',
      PRESENTACION: 'CANECA X 20 KG',
      TIPO_PRODUCTO: 'MATERIA_PRIMA',
    },
    {
      PRODUCTO: 'FLLM706',
      PRESENTACION: 'CANECA X 20 KG',
      TIPO_PRODUCTO: 'MATERIA_PRIMA',
    },
    {
      PRODUCTO: 'FFA648',
      PRESENTACION: 'CANECA X 20 KG',
      TIPO_PRODUCTO: 'MATERIA_PRIMA',
    },
    {
      PRODUCTO: 'FKW',
      PRESENTACION: 'CANECA X 20 KG',
      TIPO_PRODUCTO: 'MATERIA_PRIMA',
    },
    {
      PRODUCTO: 'FF105',
      PRESENTACION: 'CANECA X 20 KG',
      TIPO_PRODUCTO: 'MATERIA_PRIMA',
    },
    {
      PRODUCTO: 'FLV54',
      PRESENTACION: 'CANECA X 20 KG',
      TIPO_PRODUCTO: 'MATERIA_PRIMA',
    },
    {
      PRODUCTO: 'FNC',
      PRESENTACION: 'CANECA X 20 KG',
      TIPO_PRODUCTO: 'MATERIA_PRIMA',
    },
    {
      PRODUCTO: 'FLLM',
      PRESENTACION: 'CANECA X 20 KG',
      TIPO_PRODUCTO: 'MATERIA_PRIMA',
    },
    {
      PRODUCTO: 'FBM',
      PRESENTACION: 'CANECA X 20 KG',
      TIPO_PRODUCTO: 'MATERIA_PRIMA',
    },
    {
      PRODUCTO: 'FPI',
      PRESENTACION: 'CANECA X 20 KG',
      TIPO_PRODUCTO: 'MATERIA_PRIMA',
    },
    {
      PRODUCTO: 'FATC',
      PRESENTACION: 'CANECA X 20 KG',
      TIPO_PRODUCTO: 'MATERIA_PRIMA',
    },
    {
      PRODUCTO: 'FAVN',
      PRESENTACION: 'CANECA X 20 KG',
      TIPO_PRODUCTO: 'MATERIA_PRIMA',
    },
    {
      PRODUCTO: 'CEL',
      PRESENTACION: 'CANECA X 20 KG',
      TIPO_PRODUCTO: 'MATERIA_PRIMA',
    },
    {
      PRODUCTO: 'RTC12',
      PRESENTACION: 'CANECA X 15KG',
      TIPO_PRODUCTO: 'MATERIA_PRIMA',
    },
    {
      PRODUCTO: 'CVD',
      PRESENTACION: 'CANECA X 1 KG',
      TIPO_PRODUCTO: 'MATERIA_PRIMA',
    },
    {
      PRODUCTO: 'CVLT',
      PRESENTACION: 'CANECA X 0 5 KG',
      TIPO_PRODUCTO: 'MATERIA_PRIMA',
    },
    {
      PRODUCTO: 'CNJ6',
      PRESENTACION: 'CANECA X 0 5 KG',
      TIPO_PRODUCTO: 'MATERIA_PRIMA',
    },
    {
      PRODUCTO: 'CAZ',
      PRESENTACION: 'CANECA X 1 KG',
      TIPO_PRODUCTO: 'MATERIA_PRIMA',
    },
    {
      PRODUCTO: 'FLMT',
      PRESENTACION: 'CANECA X 20 KG',
      TIPO_PRODUCTO: 'MATERIA_PRIMA',
    },
    {
      PRODUCTO: 'EMLD',
      PRESENTACION: 'CANECA X 20 KG',
      TIPO_PRODUCTO: 'MATERIA_PRIMA',
    },
    {
      PRODUCTO: 'CALL5',
      PRESENTACION: 'CAJA X 1KG',
      TIPO_PRODUCTO: 'MATERIA_PRIMA',
    },
    {
      PRODUCTO: 'CPNG',
      PRESENTACION: 'CAJA X 1KG',
      TIPO_PRODUCTO: 'MATERIA_PRIMA',
    },
    {
      PRODUCTO: 'FCNJA',
      PRESENTACION: 'GARRAFA X 20 KG',
      TIPO_PRODUCTO: 'MATERIA_PRIMA',
    },
    {
      PRODUCTO: 'FLOF',
      PRESENTACION: 'GARRAFA X 20 KG',
      TIPO_PRODUCTO: 'MATERIA_PRIMA',
    },
    {
      PRODUCTO: 'AQP25',
      PRESENTACION: 'CANECA X 20 KG',
      TIPO_PRODUCTO: 'MATERIA_PRIMA',
    },
    {
      PRODUCTO: 'ACOX',
      PRESENTACION: 'BULTO X 20 KG',
      TIPO_PRODUCTO: 'MATERIA_PRIMA',
    },
    {
      PRODUCTO: 'NH10',
      PRESENTACION: 'BULTO X 20 KG',
      TIPO_PRODUCTO: 'MATERIA_PRIMA',
    },
    {
      PRODUCTO: 'NAH50',
      PRESENTACION: 'GARRAFA 20 KG',
      TIPO_PRODUCTO: 'MATERIA_PRIMA',
    },
    {
      PRODUCTO: 'TLS',
      PRESENTACION: 'BULTO X 20 KG',
      TIPO_PRODUCTO: 'MATERIA_PRIMA',
    },
    {
      PRODUCTO: 'GEC45',
      PRESENTACION: 'BULTO X 25 KG',
      TIPO_PRODUCTO: 'MATERIA_PRIMA',
    },
    {
      PRODUCTO: 'CPE03',
      PRESENTACION: 'BULTO X 20 KG',
      TIPO_PRODUCTO: 'MATERIA_PRIMA',
    },
    {
      PRODUCTO: 'CRD',
      PRESENTACION: 'CAJA X 1KG',
      TIPO_PRODUCTO: 'MATERIA_PRIMA',
    },
    {
      PRODUCTO: 'CVFWG',
      PRESENTACION: 'CAJA X 1KG',
      TIPO_PRODUCTO: 'MATERIA_PRIMA',
    },
    {
      PRODUCTO: 'PKOH',
      PRESENTACION: 'BULTO X 25 KG',
      TIPO_PRODUCTO: 'MATERIA_PRIMA',
    },
    {
      PRODUCTO: 'ACPO',
      PRESENTACION: 'CANECA X 25KG',
      TIPO_PRODUCTO: 'MATERIA_PRIMA',
    },
    {
      PRODUCTO: 'NAH99',
      PRESENTACION: 'CANECA X 25KG',
      TIPO_PRODUCTO: 'MATERIA_PRIMA',
    },
    {
      PRODUCTO: 'NSIO',
      PRESENTACION: 'CANECA X KL',
      TIPO_PRODUCTO: 'MATERIA_PRIMA',
    },
    {
      PRODUCTO: 'CHDL',
      PRESENTACION: 'CANECA X KL',
      TIPO_PRODUCTO: 'MATERIA_PRIMA',
    },
    {
      PRODUCTO: 'ACOH7',
      PRESENTACION: 'CANECA X 4KG',
      TIPO_PRODUCTO: 'MATERIA_PRIMA',
    },
    {
      PRODUCTO: 'AQM',
      PRESENTACION: 'BULTO X 25 KG',
      TIPO_PRODUCTO: 'MATERIA_PRIMA',
    },
    {
      PRODUCTO: 'HECN',
      PRESENTACION: 'BULTO X 25 KG',
      TIPO_PRODUCTO: 'MATERIA_PRIMA',
    },
    {
      PRODUCTO: 'GXT',
      PRESENTACION: 'BULTO X 25 KG',
      TIPO_PRODUCTO: 'MATERIA_PRIMA',
    },
    {
      PRODUCTO: 'PNG',
      PRESENTACION: 'CANECA X 15KG',
      TIPO_PRODUCTO: 'MATERIA_PRIMA',
    },
    {
      PRODUCTO: 'AQF45',
      PRESENTACION: 'CANECA X 200KG',
      TIPO_PRODUCTO: 'MATERIA_PRIMA',
    },
    {
      PRODUCTO: 'DEA',
      PRESENTACION: 'GARRAFA X 20KG',
      TIPO_PRODUCTO: 'MATERIA_PRIMA',
    },
    {
      PRODUCTO: 'NACH',
      PRESENTACION: 'BULTO X 25 KG',
      TIPO_PRODUCTO: 'MATERIA_PRIMA',
    },
    {
      PRODUCTO: 'FLVF',
      PRESENTACION: 'GARRAFA 20 KG',
      TIPO_PRODUCTO: 'MATERIA_PRIMA',
    },
    {
      PRODUCTO: 'CVLD',
      PRESENTACION: 'CAJA X 1KG',
      TIPO_PRODUCTO: 'MATERIA_PRIMA',
    },
    {
      PRODUCTO: 'TRPX',
      PRESENTACION: 'CANECA X 20KG',
      TIPO_PRODUCTO: 'MATERIA_PRIMA',
    },
    {
      PRODUCTO: 'BST',
      PRESENTACION: 'CANECA X 20KG',
      TIPO_PRODUCTO: 'MATERIA_PRIMA',
    },
    {
      PRODUCTO: 'ACIDO X 500',
      PRESENTACION: 'paquete x 200 unidades',
      TIPO_PRODUCTO: 'MATERIAL_DE_ENVASE',
    },
    {
      PRODUCTO: 'AMBAR  X 120',
      PRESENTACION: 'paquete x 63 unidades',
      TIPO_PRODUCTO: 'MATERIAL_DE_ENVASE',
    },
    {
      PRODUCTO: 'AMBAR  X 240',
      PRESENTACION: 'paquete x 68 unidades',
      TIPO_PRODUCTO: 'MATERIAL_DE_ENVASE',
    },
    {
      PRODUCTO: 'AMBAR  X 500',
      PRESENTACION: 'paquete x 24 unidades',
      TIPO_PRODUCTO: 'MATERIAL_DE_ENVASE',
    },
    {
      PRODUCTO: 'ANATOMICO BLANCO',
      PRESENTACION: 'paquete x 28 unidades',
      TIPO_PRODUCTO: 'MATERIAL_DE_ENVASE',
    },
    {
      PRODUCTO: 'ANATOMICO X 500',
      PRESENTACION: 'paquete x 200 unidades',
      TIPO_PRODUCTO: 'MATERIAL_DE_ENVASE',
    },
    {
      PRODUCTO: 'ANILLADO X 150',
      PRESENTACION: 'paquete x 357 unidades',
      TIPO_PRODUCTO: 'MATERIAL_DE_ENVASE',
    },
    {
      PRODUCTO: 'ANILLADO X 500',
      PRESENTACION: 'paquete x 171 unidades',
      TIPO_PRODUCTO: 'MATERIAL_DE_ENVASE',
    },
    {
      PRODUCTO: 'ANILLADO X 810',
      PRESENTACION: 'paquete x 119 unidades',
      TIPO_PRODUCTO: 'MATERIAL_DE_ENVASE',
    },
    {
      PRODUCTO: 'BALA X 120',
      PRESENTACION: 'paquete x 250 unidades',
      TIPO_PRODUCTO: 'MATERIAL_DE_ENVASE',
    },
    {
      PRODUCTO: 'BALA X 240',
      PRESENTACION: 'paquete x 60 unidades',
      TIPO_PRODUCTO: 'MATERIAL_DE_ENVASE',
    },
    {
      PRODUCTO: 'BALA X 500',
      PRESENTACION: 'paquete x 142 unidades',
      TIPO_PRODUCTO: 'MATERIAL_DE_ENVASE',
    },
    {
      PRODUCTO: 'BLANQUEADOR X 1000',
      PRESENTACION: 'paquete x 100 unidades',
      TIPO_PRODUCTO: 'MATERIAL_DE_ENVASE',
    },
    {
      PRODUCTO: 'BLANQUEADOR X 2000',
      PRESENTACION: 'paquete x 30 unidades',
      TIPO_PRODUCTO: 'MATERIAL_DE_ENVASE',
    },
    {
      PRODUCTO: 'BLANQUEADOR X 4000',
      PRESENTACION: 'paquete x 26 unidades',
      TIPO_PRODUCTO: 'MATERIAL_DE_ENVASE',
    },
    {
      PRODUCTO: 'BLANQUEADOR X 500',
      PRESENTACION: 'paquete x 220 unidades',
      TIPO_PRODUCTO: 'MATERIAL_DE_ENVASE',
    },
    {
      PRODUCTO: 'CAMPANA  X 1000',
      PRESENTACION: 'paquete x 60 unidades',
      TIPO_PRODUCTO: 'MATERIAL_DE_ENVASE',
    },
    {
      PRODUCTO: 'CAMPANA  X 300',
      PRESENTACION: 'paquete x 60 unidades',
      TIPO_PRODUCTO: 'MATERIAL_DE_ENVASE',
    },
    {
      PRODUCTO: 'CAMPANA  X 500',
      PRESENTACION: 'paquete x 119 unidades',
      TIPO_PRODUCTO: 'MATERIAL_DE_ENVASE',
    },
    {
      PRODUCTO: 'CISNE X 500 ',
      PRESENTACION: 'paquete x 247 unidades',
      TIPO_PRODUCTO: 'MATERIAL_DE_ENVASE',
    },
    {
      PRODUCTO: 'CISNE X 850 ',
      PRESENTACION: 'paquete x 130 unidades',
      TIPO_PRODUCTO: 'MATERIAL_DE_ENVASE',
    },
    {
      PRODUCTO: 'CUADRADO X 3000',
      PRESENTACION: 'paquete x 35 unidades',
      TIPO_PRODUCTO: 'MATERIAL_DE_ENVASE',
    },
    {
      PRODUCTO: 'FRESH X 150 ',
      PRESENTACION: 'paquete x 351 unidades',
      TIPO_PRODUCTO: 'MATERIAL_DE_ENVASE',
    },
    {
      PRODUCTO: 'GARRAFA RECICLADA',
      PRESENTACION: 'unidad',
      TIPO_PRODUCTO: 'MATERIAL_DE_ENVASE',
    },
    {
      PRODUCTO: 'GARRAFAS 10 LITROS SIN TAPA',
      PRESENTACION: 'UNIDAD',
      TIPO_PRODUCTO: 'MATERIAL_DE_ENVASE',
    },
    {
      PRODUCTO: 'GARRAFAS AZULES',
      PRESENTACION: 'paquete x 6 unidades',
      TIPO_PRODUCTO: 'MATERIAL_DE_ENVASE',
    },
    {
      PRODUCTO: 'GATILLO NEGRO TAPA SILICONA',
      PRESENTACION: 'caja x 1000 unidades',
      TIPO_PRODUCTO: 'MATERIAL_DE_ENVASE',
    },
    {
      PRODUCTO: 'LAVADORA X 1000',
      PRESENTACION: 'paquete x 100 unidades',
      TIPO_PRODUCTO: 'MATERIAL_DE_ENVASE',
    },
    {
      PRODUCTO: 'LAVADORA X 2000',
      PRESENTACION: 'paquete x 60 unidades',
      TIPO_PRODUCTO: 'MATERIAL_DE_ENVASE',
    },
    {
      PRODUCTO: 'LAVADORA X 4000',
      PRESENTACION: 'paquete x 24 unidades',
      TIPO_PRODUCTO: 'MATERIAL_DE_ENVASE',
    },
    {
      PRODUCTO: 'ELICO X 120',
      PRESENTACION: 'paquete x 350 unidades',
      TIPO_PRODUCTO: 'MATERIAL_DE_ENVASE',
    },
    {
      PRODUCTO: 'ELICO X 240',
      PRESENTACION: 'paquete x 320 unidades',
      TIPO_PRODUCTO: 'MATERIAL_DE_ENVASE',
    },
    {
      PRODUCTO: 'MORADO 2 L',
      PRESENTACION: 'paquete x 50 unidades',
      TIPO_PRODUCTO: 'MATERIAL_DE_ENVASE',
    },
    {
      PRODUCTO: 'MORADO 4 L',
      PRESENTACION: 'paquete x 26 unidades',
      TIPO_PRODUCTO: 'MATERIAL_DE_ENVASE',
    },
    {
      PRODUCTO: 'MORADO X 1000',
      PRESENTACION: 'paquete x 110 unidades',
      TIPO_PRODUCTO: 'MATERIAL_DE_ENVASE',
    },
    {
      PRODUCTO: 'MORADO X 500',
      PRESENTACION: 'paquete x 220 unidades',
      TIPO_PRODUCTO: 'MATERIAL_DE_ENVASE',
    },
    {
      PRODUCTO: 'ORIGINAL X 2000',
      PRESENTACION: 'paquete x 50 unidades',
      TIPO_PRODUCTO: 'MATERIAL_DE_ENVASE',
    },
    {
      PRODUCTO: 'ORIGINAL X 4000',
      PRESENTACION: 'paquete x 30 unidades',
      TIPO_PRODUCTO: 'MATERIAL_DE_ENVASE',
    },
    {
      PRODUCTO: 'PISTOLA LIMPIAVIDRIOS',
      PRESENTACION: 'Caja x 1000 unidades',
      TIPO_PRODUCTO: 'MATERIAL_DE_ENVASE',
    },
    {
      PRODUCTO: 'RECICLADO X 2000',
      PRESENTACION: 'paquete x 50 unidades',
      TIPO_PRODUCTO: 'MATERIAL_DE_ENVASE',
    },
    {
      PRODUCTO: 'RECICLADO X 4000',
      PRESENTACION: 'paquete x 30 unidades',
      TIPO_PRODUCTO: 'MATERIAL_DE_ENVASE',
    },
    {
      PRODUCTO: 'REMOVEDOR X 450',
      PRESENTACION: 'paquete x 200 unidades',
      TIPO_PRODUCTO: 'MATERIAL_DE_ENVASE',
    },
    {
      PRODUCTO: 'REMOVEDOR X 810',
      PRESENTACION: 'paquete x 100 unidades',
      TIPO_PRODUCTO: 'MATERIAL_DE_ENVASE',
    },
    {
      PRODUCTO: 'TAPA 24 MM LARGA REMOV',
      PRESENTACION: 'unidades',
      TIPO_PRODUCTO: 'MATERIAL_DE_ENVASE',
    },
    {
      PRODUCTO: 'TAPA 28 AZUL',
      PRESENTACION: 'caja x 4800 unidades',
      TIPO_PRODUCTO: 'MATERIAL_DE_ENVASE',
    },
    {
      PRODUCTO: 'TAPA 28 MORADA',
      PRESENTACION: 'caja x 4800 unidades',
      TIPO_PRODUCTO: 'MATERIAL_DE_ENVASE',
    },
    {
      PRODUCTO: 'TAPA 28 NARANJA',
      PRESENTACION: 'caja x 4800 unidades',
      TIPO_PRODUCTO: 'MATERIAL_DE_ENVASE',
    },
    {
      PRODUCTO: 'TAPA 28 ROJA',
      PRESENTACION: 'caja x 4800 unidades',
      TIPO_PRODUCTO: 'MATERIAL_DE_ENVASE',
    },
    {
      PRODUCTO: 'TAPA 28 ROSADA',
      PRESENTACION: 'caja x 4800 unidades',
      TIPO_PRODUCTO: 'MATERIAL_DE_ENVASE',
    },
    {
      PRODUCTO: 'TAPA 28 VERDE',
      PRESENTACION: 'caja x 4800 unidades',
      TIPO_PRODUCTO: 'MATERIAL_DE_ENVASE',
    },
    {
      PRODUCTO: 'TAPA 38 AZUL + TAPON',
      PRESENTACION: 'caja x 4800 unidades',
      TIPO_PRODUCTO: 'MATERIAL_DE_ENVASE',
    },
    {
      PRODUCTO: 'TAPA 38 GALON AZUL',
      PRESENTACION: 'caja x 4800 unidades',
      TIPO_PRODUCTO: 'MATERIAL_DE_ENVASE',
    },
    {
      PRODUCTO: 'TAPA DISPENSADOR LUSTRA',
      PRESENTACION: 'unidades',
      TIPO_PRODUCTO: 'MATERIAL_DE_ENVASE',
    },
    {
      PRODUCTO: 'TAPA GARRAFA',
      PRESENTACION: 'unidades',
      TIPO_PRODUCTO: 'MATERIAL_DE_ENVASE',
    },
    {
      PRODUCTO: 'TAPA LAVADORA 48',
      PRESENTACION: 'unidades',
      TIPO_PRODUCTO: 'MATERIAL_DE_ENVASE',
    },
    {
      PRODUCTO: 'TAPA PARA JABON LOZA',
      PRESENTACION: 'unidades',
      TIPO_PRODUCTO: 'MATERIAL_DE_ENVASE',
    },
    {
      PRODUCTO: 'TAPA AZUL 28mm LAINER',
      PRESENTACION: 'caja x 4800 unidades',
      TIPO_PRODUCTO: 'MATERIAL_DE_ENVASE',
    },
    {
      PRODUCTO: 'TAPA TARRINA',
      PRESENTACION: 'unidades',
      TIPO_PRODUCTO: 'MATERIAL_DE_ENVASE',
    },
    {
      PRODUCTO: 'TARRINA KL ',
      PRESENTACION: 'paquete x 100 unidades',
      TIPO_PRODUCTO: 'MATERIAL_DE_ENVASE',
    },
    {
      PRODUCTO: 'TARRINA x 250',
      PRESENTACION: 'paquete x 400 unidades',
      TIPO_PRODUCTO: 'MATERIAL_DE_ENVASE',
    },
    {
      PRODUCTO: 'VALVULAS JM',
      PRESENTACION: 'Caja',
      TIPO_PRODUCTO: 'MATERIAL_DE_ENVASE',
    },
    {
      PRODUCTO: 'TAPA 38 GALON ROJA',
      PRESENTACION: 'unidades',
      TIPO_PRODUCTO: 'MATERIAL_DE_ENVASE',
    },
    {
      PRODUCTO: 'ANILLADO 4.0L',
      PRESENTACION: 'paquete x 36 unidades',
      TIPO_PRODUCTO: 'MATERIAL_DE_ENVASE',
    },
    {
      PRODUCTO: 'ANILLADO 2.0L',
      PRESENTACION: 'paquete x 50 unidades',
      TIPO_PRODUCTO: 'MATERIAL_DE_ENVASE',
    },
    {
      PRODUCTO: 'ASAS BLANCAS',
      PRESENTACION: 'paquete x 2108 unidades',
      TIPO_PRODUCTO: 'MATERIAL_DE_ENVASE',
    },
    {
      PRODUCTO: 'TAPAS BLANCAS 38mm',
      PRESENTACION: 'paquete x 3160 unidades',
      TIPO_PRODUCTO: 'MATERIAL_DE_ENVASE',
    },
  ];

  constructor(
    @InjectRepository(Presentacion)
    private readonly presRepo: Repository<Presentacion>,

    @InjectRepository(UnidadMedida)
    private readonly umRepo: Repository<UnidadMedida>,

    @InjectRepository(Producto)
    private readonly productoRepo: Repository<Producto>,
  ) {}

  async seedMateriasPrimas(): Promise<{ message: string }> {
    // 2.1 Upsert Presentaciones
    console.log('Prueba');
    const presentaciones = Array.from(
      new Set(this.rows.map((r) => r.PRESENTACION.trim())),
    );
    const presMap = new Map<string, Presentacion>();
    for (const nombre of presentaciones) {
      let pres = await this.presRepo.findOne({ where: { nombre } });
      if (!pres) {
        pres = this.presRepo.create({ nombre });
        pres = await this.presRepo.save(pres);
      }
      presMap.set(nombre, pres);
    }

    // 2.2 Upsert Unidad "KG"
    const UMNOMBRE = 'KG';
    let um = await this.umRepo.findOne({ where: { nombre: UMNOMBRE } });
    if (!um) {
      um = this.umRepo.create({ nombre: UMNOMBRE });
      um = await this.umRepo.save(um);
    }

    // 2.3) Crear Productos
    for (const row of this.rows) {
      const pres = presMap.get(row.PRESENTACION.trim());
      if (!pres) continue;

      let prod = await this.productoRepo.findOne({
        where: { nombre: row.PRODUCTO },
      });

      if (!prod) {
        // Casteamos a DeepPartial y usamos los tres campos:
        const ent = this.productoRepo.create({
          nombre: row.PRODUCTO,
          tipoProducto: row.TIPO_PRODUCTO, // <-- asignamos el tipo dinámico
          subtipoInsumo: undefined,
          estado: 'ACTIVO',
          presentacion: pres,
          unidadMedida: um,
          proveedor: undefined,
        } as DeepPartial<Producto>);

        prod = await this.productoRepo.save(ent);
        this.logger.log(`Producto creado: ${row.PRODUCTO}`);
      } else {
        this.logger.log(`Producto ya existe: ${row.PRODUCTO}`);
      }
    }

    return { message: 'Seed de Materias Primas completado' };
  }
}
