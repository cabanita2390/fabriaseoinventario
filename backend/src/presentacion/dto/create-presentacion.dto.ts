import { IsNotEmpty, IsString, MaxLength } from 'class-validator';

export class CreatePresentacionDto {
  @IsNotEmpty()
  @IsString()
  @MaxLength(45)
  nombre: string;
}
