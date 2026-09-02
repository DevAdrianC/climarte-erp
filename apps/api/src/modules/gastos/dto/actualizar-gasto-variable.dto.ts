import { PartialType } from "@nestjs/mapped-types";
import { CrearGastoVariableDto } from "./crear-gasto-variable.dto";

export class ActualizarGastoVariableDto extends PartialType(
  CrearGastoVariableDto,
) {}
