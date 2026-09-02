import { PartialType } from "@nestjs/mapped-types";
import { CrearGastoFijoDto } from "./crear-gasto-fijo.dto";

export class ActualizarGastoFijoDto extends PartialType(CrearGastoFijoDto) {}
