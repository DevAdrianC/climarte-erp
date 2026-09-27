import {
  IsUUID,
  IsNumber,
  IsOptional,
  Min,
  IsDateString,
  IsString,
} from "class-validator";

export class CrearRetiroDto {
  @IsUUID()
  socioId: string;

  @IsNumber()
  @Min(0)
  importe: number;

  @IsOptional()
  @IsDateString()
  fecha?: string;

  @IsOptional()
  @IsString()
  concepto?: string;

  @IsOptional()
  @IsString()
  observaciones?: string;
}
