import { Module } from "@nestjs/common";
import { LiquidacionModule } from "../liquidacion/liquidacion.module";
import { DashboardController } from "./dashboard.controller";
import { DashboardService } from "./dashboard.service";

@Module({
  imports: [LiquidacionModule],
  controllers: [DashboardController],
  providers: [DashboardService],
})
export class DashboardModule {}
