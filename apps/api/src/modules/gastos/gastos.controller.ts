import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Query,
} from "@nestjs/common";
import { GastosService } from "./gastos.service";
import { CrearGastoFijoDto } from "./dto/crear-gasto-fijo.dto";
import { ActualizarGastoFijoDto } from "./dto/actualizar-gasto-fijo.dto";
import { CrearGastoVariableDto } from "./dto/crear-gasto-variable.dto";
import { ActualizarGastoVariableDto } from "./dto/actualizar-gasto-variable.dto";
import { CrearProveedorDto } from "./dto/crear-proveedor.dto";

@Controller("api")
export class GastosController {
  constructor(private readonly gastosService: GastosService) {}

  @Post("gastos-fijos")
  crearFijo(@Body() dto: CrearGastoFijoDto) {
    return this.gastosService.crearFijo(dto);
  }

  @Get("gastos-fijos")
  listarFijos() {
    return this.gastosService.listarFijos();
  }

  @Patch("gastos-fijos/:id")
  actualizarFijo(@Param("id") id: string, @Body() dto: ActualizarGastoFijoDto) {
    return this.gastosService.actualizarFijo(id, dto);
  }

  @Post("gastos-variables")
  crearVariable(@Body() dto: CrearGastoVariableDto) {
    return this.gastosService.crearVariable(dto);
  }

  @Get("gastos-variables")
  listarVariables(
    @Query("categoriaId") categoriaId?: string,
    @Query("soloConTrabajo") soloConTrabajo?: string,
  ) {
    return this.gastosService.listarVariables(
      categoriaId,
      soloConTrabajo === undefined ? undefined : soloConTrabajo === "true",
    );
  }

  @Patch("gastos-variables/:id")
  actualizarVariable(
    @Param("id") id: string,
    @Body() dto: ActualizarGastoVariableDto,
  ) {
    return this.gastosService.actualizarVariable(id, dto);
  }

  @Post("proveedores")
  crearProveedor(@Body() dto: CrearProveedorDto) {
    return this.gastosService.crearProveedor(dto);
  }

  @Get("proveedores")
  listarProveedores() {
    return this.gastosService.listarProveedores();
  }

  @Get("categorias-gasto")
  listarCategorias() {
    return this.gastosService.listarCategorias();
  }
}
