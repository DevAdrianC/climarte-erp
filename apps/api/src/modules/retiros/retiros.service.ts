import { Injectable } from "@nestjs/common";
import { PrismaService } from "../../prisma/prisma.service";
import { CrearRetiroDto } from "./dto/crear-retiro.dto";

@Injectable()
export class RetirosService {
  constructor(private readonly prisma: PrismaService) {}

  crear(dto: CrearRetiroDto, creadoPorId: string) {
    return this.prisma.retiroSocio.create({
      data: {
        ...dto,
        fecha: dto.fecha ? new Date(dto.fecha) : undefined,
        creadoPorId,
      },
    });
  }

  /**
   * Listado filtrable por socio y por período (YYYY-MM), para la pantalla
   * de Liquidación y para consultas puntuales (Sprint 5).
   */
  listar(socioId?: string, periodo?: string) {
    let fecha: { gte: Date; lt: Date } | undefined;
    if (periodo) {
      const [anio, mes] = periodo.split("-").map(Number);
      fecha = { gte: new Date(anio, mes - 1, 1), lt: new Date(anio, mes, 1) };
    }
    return this.prisma.retiroSocio.findMany({
      where: { socioId, fecha },
      include: { socio: true },
      orderBy: { fecha: "desc" },
    });
  }
}
