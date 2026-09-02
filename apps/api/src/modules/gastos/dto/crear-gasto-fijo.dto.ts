import { IsString, IsUUID, IsNumber, IsOptional, Min } from "class-validator";

export class CrearGastoFijoDto {
  @IsUUID()
  categoriaId: string;

  @IsNumber()
  @Min(0)
  importeMensual: number;

  @IsOptional()
  @IsString()
  descripcion?: string;
}
