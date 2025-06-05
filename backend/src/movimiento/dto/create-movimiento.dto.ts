// src/movimiento/dto/create-movimiento.dto.ts
import {
  IsNotEmpty,
  IsEnum,
  IsInt,
  Min,
  IsOptional,
  IsString,
  MaxLength,
} from 'class-validator';

export enum TipoMovimiento {
  INGRESO = 'INGRESO',
  EGRESO = 'EGRESO',
}

export class CreateMovimientoDto {
  @IsNotEmpty()
  @IsEnum(TipoMovimiento)
  tipo: TipoMovimiento;

  @IsNotEmpty()
  @IsInt()
  @Min(1)
  cantidad: number;

  @IsOptional()
  @IsString()
  @MaxLength(200)
  descripcion?: string;

  @IsNotEmpty()
  @IsInt()
  producto_idproducto: number;

  @IsNotEmpty()
  @IsInt()
  bodega_idbodega: number;
}
