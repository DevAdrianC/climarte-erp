import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Query,
} from "@nestjs/common";
import { HerramientasService } from "./herramientas.service";
import { CrearHerramientaDto } from "./dto/crear-herramienta.dto";
import { ActualizarHerramientaDto } from "./dto/actualizar-herramienta.dto";

@Controller("api/herramientas")
export class HerramientasController {
  constructor(private readonly herramientasService: HerramientasService) {}

  @Post()
  crear(@Body() dto: CrearHerramientaDto) {
    return this.herramientasService.crear(dto);
  }

  @Get()
  listar(@Query("incluirBaja") incluirBaja?: string) {
    return this.herramientasService.listar(incluirBaja === "true");
  }

  @Patch(":id")
  actualizar(@Param("id") id: string, @Body() dto: ActualizarHerramientaDto) {
    return this.herramientasService.actualizar(id, dto);
  }

  @Patch(":id/dar-de-baja")
  darDeBaja(@Param("id") id: string) {
    return this.herramientasService.darDeBaja(id);
  }
}
