import { PartialType } from "@nestjs/mapped-types";
import { CrearHerramientaDto } from "./crear-herramienta.dto";

export class ActualizarHerramientaDto extends PartialType(
  CrearHerramientaDto,
) {}
