import { Module } from "@nestjs/common";
import { HerramientasController } from "./herramientas.controller";
import { HerramientasService } from "./herramientas.service";

@Module({
  controllers: [HerramientasController],
  providers: [HerramientasService],
})
export class HerramientasModule {}
