/* eslint-disable @typescript-eslint/no-unsafe-assignment */
// src/seed/seed.service.ts
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
    {
      PRODUCTO: 'TROPICLOR BLANQUEADOR ',
      PRESENTACION: 'Envase x 500 ml',
      TIPO_PRODUCTO: 'ETIQUETAS',
    },
    {
      PRODUCTO: 'TROPICLOR BLANQUEADOR ',
      PRESENTACION: 'Envase x 1 l ',
      TIPO_PRODUCTO: 'ETIQUETAS',
    },
    {
      PRODUCTO: 'TROPICLOR BLANQUEADOR ',
      PRESENTACION: 'galon x 2l ',
      TIPO_PRODUCTO: 'ETIQUETAS',
    },
    {
      PRODUCTO: 'TROPICLOR BLANQUEADOR ',
      PRESENTACION: 'galon x 3,8 l ',
      TIPO_PRODUCTO: 'ETIQUETAS',
    },
    {
      PRODUCTO: 'TROPICLOR BLANQUEADOR ',
      PRESENTACION: 'garrafa 20 l ',
      TIPO_PRODUCTO: 'ETIQUETAS',
    },
    {
      PRODUCTO: 'LAVALOZA LIQUIDO',
      PRESENTACION: 'Envase x 500 ml Disp',
      TIPO_PRODUCTO: 'ETIQUETAS',
    },
    {
      PRODUCTO: 'LAVALOZA LIQUIDO',
      PRESENTACION: 'Envase x 850 ml Disp ',
      TIPO_PRODUCTO: 'ETIQUETAS',
    },
    {
      PRODUCTO: 'LAVALOZA LIQUIDO',
      PRESENTACION: 'galon x 2l ',
      TIPO_PRODUCTO: 'ETIQUETAS',
    },
    {
      PRODUCTO: 'LAVALOZA LIQUIDO',
      PRESENTACION: 'galon x 4 l ',
      TIPO_PRODUCTO: 'ETIQUETAS',
    },
    {
      PRODUCTO: 'LAVALOZA LIQUIDO',
      PRESENTACION: 'garrafa 20 l ',
      TIPO_PRODUCTO: 'ETIQUETAS',
    },
    {
      PRODUCTO: 'LIMPIAVIDRIOS',
      PRESENTACION: 'Envase Rep X 500 ml',
      TIPO_PRODUCTO: 'ETIQUETAS',
    },
    {
      PRODUCTO: 'LIMPIAVIDRIOS',
      PRESENTACION: 'Spray x 500 ml',
      TIPO_PRODUCTO: 'ETIQUETAS',
    },
    {
      PRODUCTO: 'LIMPIAVIDRIOS',
      PRESENTACION: 'galon x 2l ',
      TIPO_PRODUCTO: 'ETIQUETAS',
    },
    {
      PRODUCTO: 'LIMPIAVIDRIOS',
      PRESENTACION: 'galon x 4 l ',
      TIPO_PRODUCTO: 'ETIQUETAS',
    },
    {
      PRODUCTO: 'LIMPIAVIDRIOS',
      PRESENTACION: 'garrafa 20 l ',
      TIPO_PRODUCTO: 'ETIQUETAS',
    },
    {
      PRODUCTO: 'LUSTRAMUEBLES',
      PRESENTACION: 'Envase x 130 ml',
      TIPO_PRODUCTO: 'ETIQUETAS',
    },
    {
      PRODUCTO: 'LUSTRAMUEBLES',
      PRESENTACION: 'Envase x 240 ml',
      TIPO_PRODUCTO: 'ETIQUETAS',
    },
    {
      PRODUCTO: 'LUSTRAMUEBLES',
      PRESENTACION: 'galon x 2l ',
      TIPO_PRODUCTO: 'ETIQUETAS',
    },
    {
      PRODUCTO: 'LUSTRAMUEBLES',
      PRESENTACION: 'galon x 4 l ',
      TIPO_PRODUCTO: 'ETIQUETAS',
    },
    {
      PRODUCTO: 'LUSTRAMUEBLES',
      PRESENTACION: 'garrafa 20 l ',
      TIPO_PRODUCTO: 'ETIQUETAS',
    },
    {
      PRODUCTO: 'DESENGRASANTE',
      PRESENTACION: 'Envase x 450 ml',
      TIPO_PRODUCTO: 'ETIQUETAS',
    },
    {
      PRODUCTO: 'DESENGRASANTE',
      PRESENTACION: 'Envase x 810 ml',
      TIPO_PRODUCTO: 'ETIQUETAS',
    },
    {
      PRODUCTO: 'DESENGRASANTE',
      PRESENTACION: 'galon x 2l ',
      TIPO_PRODUCTO: 'ETIQUETAS',
    },
    {
      PRODUCTO: 'DESENGRASANTE',
      PRESENTACION: 'galon x 4 l ',
      TIPO_PRODUCTO: 'ETIQUETAS',
    },
    {
      PRODUCTO: 'DESENGRASANTE',
      PRESENTACION: 'garrafa 20 l ',
      TIPO_PRODUCTO: 'ETIQUETAS',
    },
    {
      PRODUCTO: 'LIMPIADOR  DE TEXTILES ',
      PRESENTACION: 'Envase x 500 ml',
      TIPO_PRODUCTO: 'ETIQUETAS',
    },
    {
      PRODUCTO: 'LIMPIADOR  DE TEXTILES ',
      PRESENTACION: 'galon x 4 l ',
      TIPO_PRODUCTO: 'ETIQUETAS',
    },
    {
      PRODUCTO: 'LIMPIADOR  DE TEXTILES ',
      PRESENTACION: 'garrafa 20 l ',
      TIPO_PRODUCTO: 'ETIQUETAS',
    },
    {
      PRODUCTO: 'CERA EMULSIONADA BLANCA',
      PRESENTACION: 'Envase x 500 ml fragancia baby',
      TIPO_PRODUCTO: 'ETIQUETAS',
    },
    {
      PRODUCTO: 'CERA EMULSIONADA BLANCA',
      PRESENTACION: 'Envase x 500 ml fragancia popurry',
      TIPO_PRODUCTO: 'ETIQUETAS',
    },
    {
      PRODUCTO: 'CERA EMULSIONADA BLANCA',
      PRESENTACION: 'Envase x 500 ml fragancia canela',
      TIPO_PRODUCTO: 'ETIQUETAS',
    },
    {
      PRODUCTO: 'CERA EMULSIONADA BLANCA',
      PRESENTACION: 'Envase x 500 ml fragancia manzana',
      TIPO_PRODUCTO: 'ETIQUETAS',
    },
    {
      PRODUCTO: 'CERA EMULSIONADA BLANCA',
      PRESENTACION: 'Envase x 810 ml fragancia baby',
      TIPO_PRODUCTO: 'ETIQUETAS',
    },
    {
      PRODUCTO: 'CERA EMULSIONADA BLANCA',
      PRESENTACION: 'Envase x  810 ml fragancia popurry',
      TIPO_PRODUCTO: 'ETIQUETAS',
    },
    {
      PRODUCTO: 'CERA EMULSIONADA BLANCA',
      PRESENTACION: 'Envase x  810  ml fragancia canela',
      TIPO_PRODUCTO: 'ETIQUETAS',
    },
    {
      PRODUCTO: 'CERA EMULSIONADA BLANCA',
      PRESENTACION: 'Envase x  810 ml fragancia manzana',
      TIPO_PRODUCTO: 'ETIQUETAS',
    },
    {
      PRODUCTO: 'CERA EMULSIONADA BLANCA',
      PRESENTACION: 'Envase x 2000 ml fragancia baby',
      TIPO_PRODUCTO: 'ETIQUETAS',
    },
    {
      PRODUCTO: 'CERA EMULSIONADA BLANCA',
      PRESENTACION: 'Envase x 2000 ml fragancia popurry',
      TIPO_PRODUCTO: 'ETIQUETAS',
    },
    {
      PRODUCTO: 'CERA EMULSIONADA BLANCA',
      PRESENTACION: 'Envase x 2000 ml fragancia canela',
      TIPO_PRODUCTO: 'ETIQUETAS',
    },
    {
      PRODUCTO: 'CERA EMULSIONADA BLANCA',
      PRESENTACION: 'Envase x 2000 ml fragancia manzana',
      TIPO_PRODUCTO: 'ETIQUETAS',
    },
    {
      PRODUCTO: 'CERA EMULSIONADA BLANCA',
      PRESENTACION: 'Envase x 4000 ml fragancia baby',
      TIPO_PRODUCTO: 'ETIQUETAS',
    },
    {
      PRODUCTO: 'CERA EMULSIONADA BLANCA',
      PRESENTACION: 'Envase x 4000 ml fragancia popurry',
      TIPO_PRODUCTO: 'ETIQUETAS',
    },
    {
      PRODUCTO: 'CERA EMULSIONADA BLANCA',
      PRESENTACION: 'Envase x 4000 ml fragancia canela',
      TIPO_PRODUCTO: 'ETIQUETAS',
    },
    {
      PRODUCTO: 'CERA EMULSIONADA BLANCA',
      PRESENTACION: 'Envase x 4000 ml fragancia manzana',
      TIPO_PRODUCTO: 'ETIQUETAS',
    },
    {
      PRODUCTO: 'CERA EMULSIONADA BLANCA',
      PRESENTACION: 'UNIDAD',
      TIPO_PRODUCTO: 'ETIQUETAS',
    },
    {
      PRODUCTO: 'CERA EMULSIONADA ROJA',
      PRESENTACION: 'Envase x 500 ml fragancia baby',
      TIPO_PRODUCTO: 'ETIQUETAS',
    },
    {
      PRODUCTO: 'CERA EMULSIONADA ROJA',
      PRESENTACION: 'Envase x 500 ml fragancia popurry',
      TIPO_PRODUCTO: 'ETIQUETAS',
    },
    {
      PRODUCTO: 'CERA EMULSIONADA ROJA',
      PRESENTACION: 'Envase x 500 ml fragancia canela',
      TIPO_PRODUCTO: 'ETIQUETAS',
    },
    {
      PRODUCTO: 'CERA EMULSIONADA ROJA',
      PRESENTACION: 'Envase x 500 ml fragancia manzana',
      TIPO_PRODUCTO: 'ETIQUETAS',
    },
    {
      PRODUCTO: 'CERA EMULSIONADA ROJA',
      PRESENTACION: 'Envase x 810 ml fragancia baby',
      TIPO_PRODUCTO: 'ETIQUETAS',
    },
    {
      PRODUCTO: 'CERA EMULSIONADA ROJA',
      PRESENTACION: 'Envase x  810 ml fragancia popurry',
      TIPO_PRODUCTO: 'ETIQUETAS',
    },
    {
      PRODUCTO: 'CERA EMULSIONADA ROJA',
      PRESENTACION: 'Envase x  810  ml fragancia canela',
      TIPO_PRODUCTO: 'ETIQUETAS',
    },
    {
      PRODUCTO: 'CERA EMULSIONADA ROJA',
      PRESENTACION: 'Envase x  810 ml fragancia manzana',
      TIPO_PRODUCTO: 'ETIQUETAS',
    },
    {
      PRODUCTO: 'CERA EMULSIONADA ROJA',
      PRESENTACION: 'Envase x 2000 ml fragancia baby',
      TIPO_PRODUCTO: 'ETIQUETAS',
    },
    {
      PRODUCTO: 'CERA EMULSIONADA ROJA',
      PRESENTACION: 'Envase x 2000 ml fragancia popurry',
      TIPO_PRODUCTO: 'ETIQUETAS',
    },
    {
      PRODUCTO: 'CERA EMULSIONADA ROJA',
      PRESENTACION: 'Envase x 2000 ml fragancia canela',
      TIPO_PRODUCTO: 'ETIQUETAS',
    },
    {
      PRODUCTO: 'CERA EMULSIONADA ROJA',
      PRESENTACION: 'Envase x 2000 ml fragancia manzana',
      TIPO_PRODUCTO: 'ETIQUETAS',
    },
    {
      PRODUCTO: 'CERA EMULSIONADA ROJA',
      PRESENTACION: 'Envase x 4000 ml fragancia baby',
      TIPO_PRODUCTO: 'ETIQUETAS',
    },
    {
      PRODUCTO: 'CERA EMULSIONADA ROJA',
      PRESENTACION: 'Envase x 4000 ml fragancia popurry',
      TIPO_PRODUCTO: 'ETIQUETAS',
    },
    {
      PRODUCTO: 'CERA EMULSIONADA ROJA',
      PRESENTACION: 'Envase x 4000 ml fragancia canela',
      TIPO_PRODUCTO: 'ETIQUETAS',
    },
    {
      PRODUCTO: 'CERA EMULSIONADA ROJA',
      PRESENTACION: 'Envase x 4000 ml fragancia manzana',
      TIPO_PRODUCTO: 'ETIQUETAS',
    },
    {
      PRODUCTO: 'CERA EMULSIONADA ROJA',
      PRESENTACION: 'Enva 20 litros',
      TIPO_PRODUCTO: 'ETIQUETAS',
    },
    {
      PRODUCTO: 'CERA AUTOBRILLANTE',
      PRESENTACION: 'Envase x 500 ml',
      TIPO_PRODUCTO: 'ETIQUETAS',
    },
    {
      PRODUCTO: 'CERA AUTOBRILLANTE',
      PRESENTACION: 'Envase x 810 ml',
      TIPO_PRODUCTO: 'ETIQUETAS',
    },
    {
      PRODUCTO: 'CERA AUTOBRILLANTE',
      PRESENTACION: 'galon x 2l ',
      TIPO_PRODUCTO: 'ETIQUETAS',
    },
    {
      PRODUCTO: 'CERA AUTOBRILLANTE',
      PRESENTACION: 'galon x 4 l ',
      TIPO_PRODUCTO: 'ETIQUETAS',
    },
    {
      PRODUCTO: 'CERA AUTOBRILLANTE',
      PRESENTACION: 'garrafa 20 l ',
      TIPO_PRODUCTO: 'ETIQUETAS',
    },
    {
      PRODUCTO: 'SELLADOR PISOS',
      PRESENTACION: 'Envase x 500 ml',
      TIPO_PRODUCTO: 'ETIQUETAS',
    },
    {
      PRODUCTO: 'SELLADOR PISOS',
      PRESENTACION: 'Envase x 810 ml',
      TIPO_PRODUCTO: 'ETIQUETAS',
    },
    {
      PRODUCTO: 'SELLADOR PISOS',
      PRESENTACION: 'galon x 2l ',
      TIPO_PRODUCTO: 'ETIQUETAS',
    },
    {
      PRODUCTO: 'SELLADOR PISOS',
      PRESENTACION: 'galon x 4 l ',
      TIPO_PRODUCTO: 'ETIQUETAS',
    },
    {
      PRODUCTO: 'SELLADOR PISOS',
      PRESENTACION: 'garrafa 20 l ',
      TIPO_PRODUCTO: 'ETIQUETAS',
    },
    {
      PRODUCTO: ' MULTIUSOS',
      PRESENTACION: 'Envase x 150  ml PNO',
      TIPO_PRODUCTO: 'ETIQUETAS',
    },
    {
      PRODUCTO: ' MULTIUSOS',
      PRESENTACION: 'Envase x 150  ml CANELA',
      TIPO_PRODUCTO: 'ETIQUETAS',
    },
    {
      PRODUCTO: ' MULTIUSOS',
      PRESENTACION: 'Envase x 150  ml BABY',
      TIPO_PRODUCTO: 'ETIQUETAS',
    },
    {
      PRODUCTO: ' MULTIUSOS',
      PRESENTACION: 'Envase x 150  ml FLORES',
      TIPO_PRODUCTO: 'ETIQUETAS',
    },
    {
      PRODUCTO: ' MULTIUSOS',
      PRESENTACION: 'Envase x 500  ml PNO',
      TIPO_PRODUCTO: 'ETIQUETAS',
    },
    {
      PRODUCTO: ' MULTIUSOS',
      PRESENTACION: 'Envase x 500  ml CANELA',
      TIPO_PRODUCTO: 'ETIQUETAS',
    },
    {
      PRODUCTO: ' MULTIUSOS',
      PRESENTACION: 'Envase x 500  ml BABY',
      TIPO_PRODUCTO: 'ETIQUETAS',
    },
    {
      PRODUCTO: ' MULTIUSOS',
      PRESENTACION: 'Envase x 500  ml FLORES',
      TIPO_PRODUCTO: 'ETIQUETAS',
    },
    {
      PRODUCTO: ' MULTIUSOS',
      PRESENTACION: 'Envase x 2 l   PNO',
      TIPO_PRODUCTO: 'ETIQUETAS',
    },
    {
      PRODUCTO: ' MULTIUSOS',
      PRESENTACION: 'Envase x 2 l   CANELA',
      TIPO_PRODUCTO: 'ETIQUETAS',
    },
    {
      PRODUCTO: ' MULTIUSOS',
      PRESENTACION: 'Envase x 2 l   BABY',
      TIPO_PRODUCTO: 'ETIQUETAS',
    },
    {
      PRODUCTO: ' MULTIUSOS',
      PRESENTACION: 'Envase x 2 l FLORES',
      TIPO_PRODUCTO: 'ETIQUETAS',
    },
    {
      PRODUCTO: ' MULTIUSOS',
      PRESENTACION: 'Envase x  4l   PNO',
      TIPO_PRODUCTO: 'ETIQUETAS',
    },
    {
      PRODUCTO: ' MULTIUSOS',
      PRESENTACION: 'Envase x 4 l   CANELA',
      TIPO_PRODUCTO: 'ETIQUETAS',
    },
    {
      PRODUCTO: ' MULTIUSOS',
      PRESENTACION: 'Envase x 4 l   BABY',
      TIPO_PRODUCTO: 'ETIQUETAS',
    },
    {
      PRODUCTO: ' MULTIUSOS',
      PRESENTACION: 'Envase x 4l FLORES',
      TIPO_PRODUCTO: 'ETIQUETAS',
    },
    {
      PRODUCTO: ' MULTIUSOS',
      PRESENTACION: 'garrafa 20 l',
      TIPO_PRODUCTO: 'ETIQUETAS',
    },
    {
      PRODUCTO: 'JABON INDUSTRIAL TROPIDEX',
      PRESENTACION: 'Envase 2 L',
      TIPO_PRODUCTO: 'ETIQUETAS',
    },
    {
      PRODUCTO: 'JABON INDUSTRIAL TROPIDEX',
      PRESENTACION: 'Galón x 4  L',
      TIPO_PRODUCTO: 'ETIQUETAS',
    },
    {
      PRODUCTO: 'JABON INDUSTRIAL TROPIDEX',
      PRESENTACION: 'Garrafa x 5 galones',
      TIPO_PRODUCTO: 'ETIQUETAS',
    },
    {
      PRODUCTO: 'LIMPIADOR DE JUNTAS COMO EL MURIATICO ',
      PRESENTACION: 'Envase x 500 ml',
      TIPO_PRODUCTO: 'ETIQUETAS',
    },
    {
      PRODUCTO: 'LIMPIADOR DE JUNTAS COMO EL MURIATICO ',
      PRESENTACION: 'galon x 2l ',
      TIPO_PRODUCTO: 'ETIQUETAS',
    },
    {
      PRODUCTO: 'JABON LIQUIDO MANOS FORMULA MEJORADA ',
      PRESENTACION: 'Envase x 500 ml avena',
      TIPO_PRODUCTO: 'ETIQUETAS',
    },
    {
      PRODUCTO: 'JABON LIQUIDO MANOS FORMULA MEJORADA ',
      PRESENTACION: 'Envase x 500 ml baby',
      TIPO_PRODUCTO: 'ETIQUETAS',
    },
    {
      PRODUCTO: 'JABON LIQUIDO MANOS FORMULA MEJORADA ',
      PRESENTACION: 'Envase x 500 ml kiwy',
      TIPO_PRODUCTO: 'ETIQUETAS',
    },
    {
      PRODUCTO: 'JABON LIQUIDO MANOS FORMULA MEJORADA ',
      PRESENTACION: 'Envase x 500 ml manzana',
      TIPO_PRODUCTO: 'ETIQUETAS',
    },
    {
      PRODUCTO: 'JABON LIQUIDO MANOS FORMULA MEJORADA ',
      PRESENTACION: 'Envase x 1000 ml avena',
      TIPO_PRODUCTO: 'ETIQUETAS',
    },
    {
      PRODUCTO: 'JABON LIQUIDO MANOS FORMULA MEJORADA ',
      PRESENTACION: 'Envase x 1000 ml baby',
      TIPO_PRODUCTO: 'ETIQUETAS',
    },
    {
      PRODUCTO: 'JABON LIQUIDO MANOS FORMULA MEJORADA ',
      PRESENTACION: 'Envase x 1000 ml kiwy',
      TIPO_PRODUCTO: 'ETIQUETAS',
    },
    {
      PRODUCTO: 'JABON LIQUIDO MANOS FORMULA MEJORADA ',
      PRESENTACION: 'Envase x 1000 ml manzana',
      TIPO_PRODUCTO: 'ETIQUETAS',
    },
    {
      PRODUCTO: 'JABON LIQUIDO MANOS FORMULA MEJORADA ',
      PRESENTACION: 'Envase x 2l avena',
      TIPO_PRODUCTO: 'ETIQUETAS',
    },
    {
      PRODUCTO: 'JABON LIQUIDO MANOS FORMULA MEJORADA ',
      PRESENTACION: 'Envase x 2l baby',
      TIPO_PRODUCTO: 'ETIQUETAS',
    },
    {
      PRODUCTO: 'JABON LIQUIDO MANOS FORMULA MEJORADA ',
      PRESENTACION: 'Envase x 2ll kiwy',
      TIPO_PRODUCTO: 'ETIQUETAS',
    },
    {
      PRODUCTO: 'JABON LIQUIDO MANOS FORMULA MEJORADA ',
      PRESENTACION: 'Envase x 2l manzana',
      TIPO_PRODUCTO: 'ETIQUETAS',
    },
    {
      PRODUCTO: 'JABON LIQUIDO MANOS FORMULA MEJORADA ',
      PRESENTACION: 'Envase x 4l avena',
      TIPO_PRODUCTO: 'ETIQUETAS',
    },
    {
      PRODUCTO: 'JABON LIQUIDO MANOS FORMULA MEJORADA ',
      PRESENTACION: 'Envase x 4l baby',
      TIPO_PRODUCTO: 'ETIQUETAS',
    },
    {
      PRODUCTO: 'JABON LIQUIDO MANOS FORMULA MEJORADA ',
      PRESENTACION: 'Envase x 4l kiwy',
      TIPO_PRODUCTO: 'ETIQUETAS',
    },
    {
      PRODUCTO: 'JABON LIQUIDO MANOS FORMULA MEJORADA ',
      PRESENTACION: 'Envase x 4l manzana',
      TIPO_PRODUCTO: 'ETIQUETAS',
    },
    {
      PRODUCTO: 'JABON LIQUIDO MANOS FORMULA MEJORADA ',
      PRESENTACION: 'garrafa 20 l ',
      TIPO_PRODUCTO: 'ETIQUETAS',
    },
    {
      PRODUCTO: 'JABON ROPA LIQUIDO',
      PRESENTACION: 'Envase x 1 L',
      TIPO_PRODUCTO: 'ETIQUETAS',
    },
    {
      PRODUCTO: 'JABON ROPA LIQUIDO',
      PRESENTACION: 'envase x 2 l ',
      TIPO_PRODUCTO: 'ETIQUETAS',
    },
    {
      PRODUCTO: 'JABON ROPA LIQUIDO',
      PRESENTACION: 'Galón  3.8 l',
      TIPO_PRODUCTO: 'ETIQUETAS',
    },
    {
      PRODUCTO: 'JABON ROPA LIQUIDO',
      PRESENTACION: 'Garrafa. 20 l',
      TIPO_PRODUCTO: 'ETIQUETAS',
    },
    {
      PRODUCTO: 'JABON INDUSTRIAL - TROPIREY ',
      PRESENTACION: 'Galón  4 l ',
      TIPO_PRODUCTO: 'ETIQUETAS',
    },
    {
      PRODUCTO: 'JABON INDUSTRIAL - TROPIREY ',
      PRESENTACION: 'Garrafa. 20 l',
      TIPO_PRODUCTO: 'ETIQUETAS',
    },
    {
      PRODUCTO: 'LLANTINA ABRILLANTADOR ',
      PRESENTACION: 'Spray x 500 ml',
      TIPO_PRODUCTO: 'ETIQUETAS',
    },
    {
      PRODUCTO: 'LLANTINA ABRILLANTADOR ',
      PRESENTACION: 'galon x 2 l',
      TIPO_PRODUCTO: 'ETIQUETAS',
    },
    {
      PRODUCTO: 'LLANTINA ABRILLANTADOR ',
      PRESENTACION: 'galon x 4  l',
      TIPO_PRODUCTO: 'ETIQUETAS',
    },
    {
      PRODUCTO: 'LLANTINA ABRILLANTADOR ',
      PRESENTACION: 'Garrafa x 20 l ',
      TIPO_PRODUCTO: 'ETIQUETAS',
    },
    {
      PRODUCTO: 'SILICONA CON FRAGANCIA',
      PRESENTACION: 'Envase x 120 ml spray ',
      TIPO_PRODUCTO: 'ETIQUETAS',
    },
    {
      PRODUCTO: 'SILICONA CON FRAGANCIA',
      PRESENTACION: 'Envase x 240 ml spray ',
      TIPO_PRODUCTO: 'ETIQUETAS',
    },
    {
      PRODUCTO: 'SILICONA CON FRAGANCIA',
      PRESENTACION: 'envase 810 ',
      TIPO_PRODUCTO: 'ETIQUETAS',
    },
    {
      PRODUCTO: 'SILICONA CON FRAGANCIA',
      PRESENTACION: 'galon x 2l ',
      TIPO_PRODUCTO: 'ETIQUETAS',
    },
    {
      PRODUCTO: 'SILICONA CON FRAGANCIA',
      PRESENTACION: 'galon x 4 l ',
      TIPO_PRODUCTO: 'ETIQUETAS',
    },
    {
      PRODUCTO: 'SILICONA CON FRAGANCIA',
      PRESENTACION: 'garrafa 20 l ',
      TIPO_PRODUCTO: 'ETIQUETAS',
    },
    {
      PRODUCTO: 'JABON INDUSTRIAL ESPUMA ACTIVA ',
      PRESENTACION: 'galon x 2l ',
      TIPO_PRODUCTO: 'ETIQUETAS',
    },
    {
      PRODUCTO: 'JABON INDUSTRIAL ESPUMA ACTIVA ',
      PRESENTACION: 'galon x 4 l ',
      TIPO_PRODUCTO: 'ETIQUETAS',
    },
    {
      PRODUCTO: 'JABON INDUSTRIAL ESPUMA ACTIVA ',
      PRESENTACION: 'garrafa 20 l ',
      TIPO_PRODUCTO: 'ETIQUETAS',
    },
    {
      PRODUCTO: 'CREOLINA INDUSTRIAL  CONCENTRADA',
      PRESENTACION: 'Envase x 120 ml ',
      TIPO_PRODUCTO: 'ETIQUETAS',
    },
    {
      PRODUCTO: 'CREOLINA INDUSTRIAL  CONCENTRADA',
      PRESENTACION: 'Envase x 240 ml ',
      TIPO_PRODUCTO: 'ETIQUETAS',
    },
    {
      PRODUCTO: 'CREOLINA INDUSTRIAL  CONCENTRADA',
      PRESENTACION: 'Envase x 500 ml',
      TIPO_PRODUCTO: 'ETIQUETAS',
    },
    {
      PRODUCTO: 'CREOLINA INDUSTRIAL  CONCENTRADA',
      PRESENTACION: 'Medio Galón x 2l ',
      TIPO_PRODUCTO: 'ETIQUETAS',
    },
    {
      PRODUCTO: 'CREOLINA INDUSTRIAL  CONCENTRADA',
      PRESENTACION: 'Galón x 4 l ',
      TIPO_PRODUCTO: 'ETIQUETAS',
    },
    {
      PRODUCTO: 'ALCOHOL INDUSTRIAL',
      PRESENTACION: 'Envase x 500 ml ',
      TIPO_PRODUCTO: 'ETIQUETAS',
    },
    {
      PRODUCTO: 'ALCOHOL INDUSTRIAL',
      PRESENTACION: 'Envase x 1000 cm3 + pistola ',
      TIPO_PRODUCTO: 'ETIQUETAS',
    },
    {
      PRODUCTO: 'ALCOHOL INDUSTRIAL',
      PRESENTACION: 'galon x 2l ',
      TIPO_PRODUCTO: 'ETIQUETAS',
    },
    {
      PRODUCTO: 'ALCOHOL INDUSTRIAL',
      PRESENTACION: 'galon x 4  l ',
      TIPO_PRODUCTO: 'ETIQUETAS',
    },
    {
      PRODUCTO: 'ALCOHOL INDUSTRIAL',
      PRESENTACION: 'garrafa 20 l ',
      TIPO_PRODUCTO: 'ETIQUETAS',
    },
    {
      PRODUCTO: 'DESTAPADOR DE CAÑERIAS no controlado ',
      PRESENTACION: 'Tarrina x 250 grs',
      TIPO_PRODUCTO: 'ETIQUETAS',
    },
    {
      PRODUCTO: 'DESTAPADOR DE CAÑERIAS no controlado ',
      PRESENTACION: 'Tarrina x 1 kilo ',
      TIPO_PRODUCTO: 'ETIQUETAS',
    },
    {
      PRODUCTO: 'HIPOCLORITO DE SODIO',
      PRESENTACION: 'Galón x 3,8 l',
      TIPO_PRODUCTO: 'ETIQUETAS',
    },
    {
      PRODUCTO: 'HIPOCLORITO DE SODIO',
      PRESENTACION: 'garrafa x 5 galones',
      TIPO_PRODUCTO: 'ETIQUETAS',
    },
    {
      PRODUCTO: 'DESMANCHADOR OXIGENADO ',
      PRESENTACION: 'Galón x 3,8 l',
      TIPO_PRODUCTO: 'ETIQUETAS',
    },
    {
      PRODUCTO: 'DESMANCHADOR OXIGENADO ',
      PRESENTACION: 'garrafa x 5 galones',
      TIPO_PRODUCTO: 'ETIQUETAS',
    },
    {
      PRODUCTO: 'ACIDO MURIATICO INDUSTRIAL ',
      PRESENTACION: 'Galon X 5 K ',
      TIPO_PRODUCTO: 'ETIQUETAS',
    },
    {
      PRODUCTO: 'ACIDO MURIATICO INDUSTRIAL ',
      PRESENTACION: 'Garrafa X 22.7 KILOS ',
      TIPO_PRODUCTO: 'ETIQUETAS',
    },
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

  async seedMateriasPrimas(): Promise<{ message: string }> {
    // 2.1 Upsert Presentaciones
    console.log('Prueba de carga seeder');
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

    // 0) Dedupe filas por PRODUCTO
    const uniqueRows = Array.from(
      new Map(
        this.rows.map((r) => [r.PRODUCTO.trim().toUpperCase(), r]),
      ).values(),
    );

    // 2.3) Crear Productos
    // for (const row of this.rows) {
    for (const row of uniqueRows) {
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

  async seedBodegas(): Promise<{ message: string }> {
    // 1) Define tu array con nombre + ubicación:
    const bodegas = [
      { nombre: 'Bodega Fabriaseo', ubicacion: 'Calle 1 no 25-46, Sogamoso' },
      { nombre: 'Bodega 2' },
    ];

    // 2) Itera e inserta sólo si no existe:
    for (const { nombre, ubicacion } of bodegas) {
      let bodega = await this.bodegaRepo.findOne({ where: { nombre } });
      if (!bodega) {
        // Crea con nombre + ubicacion
        bodega = this.bodegaRepo.create({ nombre, ubicacion });
        await this.bodegaRepo.save(bodega);
        this.logger.log(`Bodega creada: ${nombre}`);
      } else {
        this.logger.log(`Bodega ya existe: ${nombre}`);
      }
    }

    return { message: 'Seed de Bodegas completado' };
  }
}
