// src/inventario/dto/create-inventario.dto.ts
import { IsNotEmpty, IsInt, Min, IsDateString } from 'class-validator';

export class CreateInventarioDto {
  @IsNotEmpty()
  @IsInt()
  @Min(0)
  cantidad_actual: number;

  @IsNotEmpty()
  @IsDateString()
  fecha_ultima_actualizacion: string; // formato ISO

  @IsNotEmpty()
  @IsInt()
  producto_idproducto: number;

  @IsNotEmpty()
  @IsInt()
  bodega_idbodega: number;
}
