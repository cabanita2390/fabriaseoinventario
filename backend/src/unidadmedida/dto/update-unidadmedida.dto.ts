// src/unidadmedida/dto/update-unidadmedida.dto.ts
import { PartialType } from '@nestjs/mapped-types';
import { CreateUnidadmedidaDto } from './create-unidadmedida.dto';

export class UpdateUnidadmedidaDto extends PartialType(CreateUnidadmedidaDto) {}
