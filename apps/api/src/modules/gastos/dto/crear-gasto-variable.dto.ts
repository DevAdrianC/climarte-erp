import {
  IsString,
  IsUUID,
  IsNumber,
  IsOptional,
  Min,
  IsDateString,
} from "class-validator";

export class CrearGastoVariableDto {
  @IsUUID()
  categoriaId: string;

  @IsOptional()
  @IsUUID()
  proveedorId?: string;

  // Si viene, el gasto se considera costo directo de ese trabajo.
  // Si no viene, es gasto general del negocio (regla no negociable del Sprint 4).
  @IsOptional()
  @IsUUID()
  trabajoId?: string;

  @IsNumber()
  @Min(0)
  importe: number;

  @IsOptional()
  @IsDateString()
  fecha?: string;

  @IsOptional()
  @IsString()
  descripcion?: string;

  @IsOptional()
  @IsString()
  comprobanteUrl?: string;
}
