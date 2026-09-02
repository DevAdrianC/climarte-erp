import {
  IsUUID,
  IsNumber,
  IsOptional,
  Min,
  IsDateString,
} from "class-validator";

export class CrearRegistroCombustibleDto {
  // Si viene, el gasto de combustible queda asociado a ese trabajo.
  // Si no, es gasto general del vehículo (misma regla que GastoVariable).
  @IsOptional()
  @IsUUID()
  trabajoId?: string;

  @IsOptional()
  @IsDateString()
  fecha?: string;

  @IsOptional()
  @IsNumber()
  @Min(0)
  litros?: number;

  @IsNumber()
  @Min(0)
  importe: number;
}
