import { Controller, Get, Query, UseGuards } from "@nestjs/common";
import { ApiBearerAuth, ApiTags } from "@nestjs/swagger";
import { JwtAuthGuard } from "../../common/guards/jwt-auth.guard";
import { RolesGuard } from "../../common/guards/roles.guard";
import { LiquidacionService } from "./liquidacion.service";

@ApiTags("liquidacion")
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller("liquidacion")
export class LiquidacionController {
  constructor(private readonly liquidacionService: LiquidacionService) {}

  @Get()
  calcular(@Query("periodo") periodo: string) {
    return this.liquidacionService.calcular(periodo);
  }
}
