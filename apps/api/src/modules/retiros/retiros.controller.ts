import { Body, Controller, Get, Post, Query, UseGuards } from "@nestjs/common";
import { ApiBearerAuth, ApiTags } from "@nestjs/swagger";
import { JwtAuthGuard } from "../../common/guards/jwt-auth.guard";
import { RolesGuard } from "../../common/guards/roles.guard";
import { CurrentUser } from "../../common/decorators/current-user.decorator";
import { AuthenticatedUser } from "../auth/types/authenticated-user.type";
import { RetirosService } from "./retiros.service";
import { CrearRetiroDto } from "./dto/crear-retiro.dto";

@ApiTags("retiros")
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller("retiros")
export class RetirosController {
  constructor(private readonly retirosService: RetirosService) {}

  @Post()
  crear(
    @Body() dto: CrearRetiroDto,
    @CurrentUser() usuario: AuthenticatedUser,
  ) {
    return this.retirosService.crear(dto, usuario.sub);
  }

  @Get()
  listar(
    @Query("socioId") socioId?: string,
    @Query("periodo") periodo?: string,
  ) {
    return this.retirosService.listar(socioId, periodo);
  }
}
