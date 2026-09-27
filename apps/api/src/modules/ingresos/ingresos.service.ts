import {
  Injectable,
  BadRequestException,
  NotFoundException,
} from "@nestjs/common";
import { PrismaService } from "../../prisma/prisma.service";
import { CrearIngresoDto } from "./dto/crear-ingreso.dto";

@Injectable()
export class IngresosService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Solo se puede cobrar un trabajo FINALIZADO (tiene precioFinal fijado).
   * Después de registrar el ingreso, recalcula estadoPago del trabajo:
   * COBRADO si la suma de ingresos >= precioFinal, PARCIAL si es menor.
   */
  async crear(trabajoId: string, dto: CrearIngresoDto, creadoPorId: string) {
    const trabajo = await this.prisma.trabajo.findUnique({
      where: { id: trabajoId },
    });
    if (!trabajo) {
      throw new NotFoundException("Trabajo no encontrado");
    }
    if (trabajo.estadoOperativo !== "FINALIZADO") {
      throw new BadRequestException(
        "Solo se puede registrar un cobro sobre un trabajo finalizado",
      );
    }
    if (!trabajo.precioFinal) {
      throw new BadRequestException("El trabajo no tiene precio final fijado");
    }

    const ingreso = await this.prisma.ingreso.create({
      data: { ...dto, trabajoId, creadoPorId },
    });

    const { _sum } = await this.prisma.ingreso.aggregate({
      where: { trabajoId },
      _sum: { importe: true },
    });
    const totalCobrado = _sum.importe ?? 0;

    await this.prisma.trabajo.update({
      where: { id: trabajoId },
      data: {
        estadoPago:
          Number(totalCobrado) >= Number(trabajo.precioFinal)
            ? "COBRADO"
            : "PARCIAL",
      },
    });

    return ingreso;
  }

  async listarPorTrabajo(trabajoId: string) {
    return this.prisma.ingreso.findMany({
      where: { trabajoId },
      orderBy: { fecha: "desc" },
    });
  }
}
