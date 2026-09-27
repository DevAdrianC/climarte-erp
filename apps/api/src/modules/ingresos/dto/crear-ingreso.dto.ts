import {
  IsNumber,
  IsOptional,
  Min,
  IsDateString,
  IsString,
} from "class-validator";

export class CrearIngresoDto {
  @IsNumber()
  @Min(0)
  importe: number;

  @IsOptional()
  @IsDateString()
  fecha?: string;

  @IsOptional()
  @IsString()
  formaPago?: string;
}
