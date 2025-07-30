/* eslint-disable @typescript-eslint/no-unsafe-call */
// src/unidadmedida/dto/create-unidadmedida.dto.ts
import { IsNotEmpty, IsString, MaxLength } from 'class-validator';

export class CreateUnidadmedidaDto {
  @IsNotEmpty()
  @IsString()
  @MaxLength(45)
  nombre: string;
}
