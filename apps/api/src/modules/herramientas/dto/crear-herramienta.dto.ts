import {
  IsString,
  IsOptional,
  IsNumber,
  Min,
  IsDateString,
} from "class-validator";

export class CrearHerramientaDto {
  @IsString()
  nombre: string;

  @IsOptional()
  @IsString()
  categoria?: string;

  @IsOptional()
  @IsDateString()
  fechaCompra?: string;

  @IsOptional()
  @IsNumber()
  @Min(0)
  importe?: number;
}
