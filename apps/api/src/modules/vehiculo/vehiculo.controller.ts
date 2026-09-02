import { Body, Controller, Get, Param, Post } from "@nestjs/common";
import { VehiculoService } from "./vehiculo.service";
import { CrearVehiculoDto } from "./dto/crear-vehiculo.dto";
import { CrearRegistroCombustibleDto } from "./dto/crear-registro-combustible.dto";
import { CrearRegistroServiceDto } from "./dto/crear-registro-service.dto";

@Controller("api/vehiculos")
export class VehiculoController {
  constructor(private readonly vehiculoService: VehiculoService) {}

  @Post()
  crear(@Body() dto: CrearVehiculoDto) {
    return this.vehiculoService.crear(dto);
  }

  @Get()
  listar() {
    return this.vehiculoService.listar();
  }

  @Post(":id/combustible")
  agregarCombustible(
    @Param("id") id: string,
    @Body() dto: CrearRegistroCombustibleDto,
  ) {
    return this.vehiculoService.agregarCombustible(id, dto);
  }

  @Get(":id/combustible")
  listarCombustible(@Param("id") id: string) {
    return this.vehiculoService.listarCombustible(id);
  }

  @Post(":id/service")
  agregarService(
    @Param("id") id: string,
    @Body() dto: CrearRegistroServiceDto,
  ) {
    return this.vehiculoService.agregarService(id, dto);
  }

  @Get(":id/service")
  listarService(@Param("id") id: string) {
    return this.vehiculoService.listarService(id);
  }
}
