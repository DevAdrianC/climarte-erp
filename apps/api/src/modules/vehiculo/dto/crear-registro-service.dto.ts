import {
  IsString,
  IsNumber,
  IsOptional,
  Min,
  Max,
  IsDateString,
} from "class-validator";

export class CrearRegistroServiceDto {
  @IsString()
  descripcion: string;

  @IsOptional()
  @IsDateString()
  fecha?: string;

  @IsNumber()
  @Min(0)
  importeTotal: number;

  // Porcentaje del importeTotal que se atribuye al negocio (0-100). El
  // importeAtribuido se calcula en el service, nunca se recibe del cliente.
  @IsNumber()
  @Min(0)
  @Max(100)
  porcentajeAtribuido: number;
}
