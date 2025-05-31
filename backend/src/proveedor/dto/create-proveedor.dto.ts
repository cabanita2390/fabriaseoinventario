/* eslint-disable @typescript-eslint/no-unsafe-call */
// src/proveedor/dto/create-proveedor.dto.ts
import { IsNotEmpty, IsString, MaxLength, IsEmail } from 'class-validator';

export class CreateProveedorDto {
  @IsNotEmpty()
  @IsString()
  @MaxLength(100)
  nombre: string;

  @IsNotEmpty()
  @IsString()
  @MaxLength(15)
  telefono: string;

  @IsNotEmpty()
  @IsEmail()
  @MaxLength(100)
  email: string;

  @IsNotEmpty()
  @IsString()
  @MaxLength(200)
  direccion: string;
}
