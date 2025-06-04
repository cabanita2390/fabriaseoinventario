// src/bodega/dto/create-bodega.dto.ts
import { IsNotEmpty, IsString, MaxLength } from 'class-validator';

export class CreateBodegaDto {
  @IsNotEmpty()
  @IsString()
  @MaxLength(100)
  nombre: string;

  @IsNotEmpty()
  @IsString()
  @MaxLength(200)
  ubicacion: string;
}
