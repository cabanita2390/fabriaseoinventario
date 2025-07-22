import { IsNotEmpty, IsString, MaxLength, IsEnum } from 'class-validator';
import { TipoProducto } from 'src/producto/dto/create-producto.dto';

export class CreatePresentacionDto {
  @IsNotEmpty()
  @IsString()
  @MaxLength(45)
  nombre: string;

  @IsNotEmpty()
  @IsEnum(TipoProducto)
  tipoProducto: TipoProducto; // ✅ nuevo campo
}
