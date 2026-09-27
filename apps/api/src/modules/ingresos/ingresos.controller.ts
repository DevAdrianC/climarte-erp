import { Body, Controller, Get, Param, Post, UseGuards } from "@nestjs/common";
import { ApiBearerAuth, ApiTags } from "@nestjs/swagger";
import { JwtAuthGuard } from "../../common/guards/jwt-auth.guard";
import { RolesGuard } from "../../common/guards/roles.guard";
import { CurrentUser } from "../../common/decorators/current-user.decorator";
import { AuthenticatedUser } from "../auth/types/authenticated-user.type";
import { IngresosService } from "./ingresos.service";
import { CrearIngresoDto } from "./dto/crear-ingreso.dto";

@ApiTags("ingresos")
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller("trabajos/:trabajoId/ingresos")
export class IngresosController {
  constructor(private readonly ingresosService: IngresosService) {}

  @Post()
  crear(
    @Param("trabajoId") trabajoId: string,
    @Body() dto: CrearIngresoDto,
    @CurrentUser() usuario: AuthenticatedUser,
  ) {
    return this.ingresosService.crear(trabajoId, dto, usuario.sub);
  }

  @Get()
  listar(@Param("trabajoId") trabajoId: string) {
    return this.ingresosService.listarPorTrabajo(trabajoId);
  }
}
