import { IsString } from "class-validator";

export class CrearVehiculoDto {
  @IsString()
  marca: string;

  @IsString()
  modelo: string;

  @IsString()
  patente: string;
}
