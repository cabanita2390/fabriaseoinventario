/* eslint-disable @typescript-eslint/no-unsafe-call */
import {
  IsNotEmpty,
  IsString,
  MaxLength,
  IsEnum,
  IsInt,
  IsOptional,
} from 'class-validator';

export enum TipoProducto {
  MATERIA_PRIMA = 'MATERIA_PRIMA',
  MATERIAL_DE_ENVASE = 'MATERIAL_DE_ENVASE',
  ETIQUETAS = 'ETIQUETAS',
}

export enum EstadoProducto {
  ACTIVO = 'ACTIVO',
  INACTIVO = 'INACTIVO',
}

export class CreateProductoDto {
  @IsNotEmpty()
  @IsString()
  @MaxLength(100)
  nombre: string;

  @IsNotEmpty()
  @IsEnum(TipoProducto)
  tipoProducto: TipoProducto;

  @IsOptional()
  @IsString()
  @MaxLength(45)
  subtipoInsumo?: string | undefined;

  @IsNotEmpty()
  @IsEnum(EstadoProducto)
  estado: EstadoProducto;

  @IsNotEmpty()
  @IsInt()
  presentacion_idpresentacion: number;

  @IsNotEmpty()
  @IsInt()
  unidadmedida_idunidadmedida: number;

  @IsNotEmpty()
  @IsInt()
  proveedor_idproveedor: number;
}
