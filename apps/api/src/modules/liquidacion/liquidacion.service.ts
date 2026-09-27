import { Injectable, BadRequestException } from "@nestjs/common";
import { PrismaService } from "../../prisma/prisma.service";

@Injectable()
export class LiquidacionService {
  constructor(private readonly prisma: PrismaService) {}

  private rangoDelPeriodo(periodo: string) {
    const [anio, mes] = periodo.split("-").map(Number);
    if (!anio || !mes) {
      throw new BadRequestException(
        "Período inválido, formato esperado YYYY-MM",
      );
    }
    return { gte: new Date(anio, mes - 1, 1), lt: new Date(anio, mes, 1) };
  }

  async calcular(periodo: string) {
    const fecha = this.rangoDelPeriodo(periodo);

    // Socios vigentes: cualquier Usuario con rol ADMIN_SOCIO (no se hardcodean nombres).
    const socios = await this.prisma.usuario.findMany({
      where: { rol: { nombre: "ADMIN_SOCIO" } },
    });

    // Participación vigente al inicio del período (versionada, Sprint 1).
    const participaciones =
      await this.prisma.configuracionParticipacion.findMany({
        where: {
          vigenteDesde: { lte: fecha.gte },
          OR: [{ vigenteHasta: null }, { vigenteHasta: { gte: fecha.gte } }],
        },
      });

    // ---------- 1. Ganancia por mano de obra (Ingresos - Costos directos) ----------
    const ingresos = await this.prisma.ingreso.findMany({
      where: { fecha },
      include: { trabajo: { include: { costos: true } } },
    });

    let totalIngresos = 0;
    let totalCostosDirectos = 0;
    const trabajosYaContados = new Set<string>();

    for (const ingreso of ingresos) {
      totalIngresos += Number(ingreso.importe);
      // Los costos del trabajo se cuentan una sola vez, no por cada ingreso parcial.
      if (!trabajosYaContados.has(ingreso.trabajoId)) {
        trabajosYaContados.add(ingreso.trabajoId);
        totalCostosDirectos += ingreso.trabajo.costos.reduce(
          (acc, c) => acc + Number(c.importe),
          0,
        );
      }
    }

    const gananciaTotal = totalIngresos - totalCostosDirectos;

    // ---------- 2. Reembolsos por pagadoPor (NUNCA se reparten 50/50) ----------
    const costosDelPeriodo = await this.prisma.costoTrabajo.findMany({
      where: {
        trabajo: { ingresos: { some: { fecha } } },
        pagadoPorId: { not: null },
      },
    });

    const reembolsosPorSocio = new Map<string, number>();
    for (const costo of costosDelPeriodo) {
      const actual = reembolsosPorSocio.get(costo.pagadoPorId!) ?? 0;
      reembolsosPorSocio.set(
        costo.pagadoPorId!,
        actual + Number(costo.importe),
      );
    }

    // ---------- 3. Retiros ya realizados en el período ----------
    const retiros = await this.prisma.retiroSocio.findMany({
      where: { fecha },
    });
    const retirosPorSocio = new Map<string, number>();
    for (const retiro of retiros) {
      const actual = retirosPorSocio.get(retiro.socioId) ?? 0;
      retirosPorSocio.set(retiro.socioId, actual + Number(retiro.importe));
    }

    // ---------- Armar resultado por socio ----------
    const resultado = socios.map((socio) => {
      const participacion = participaciones.find((p) => p.socioId === socio.id);
      const porcentaje = participacion
        ? Number(participacion.porcentaje)
        : 100 / socios.length;

      const gananciaDelSocio = Number(
        (gananciaTotal * (porcentaje / 100)).toFixed(2),
      );
      const reembolsosDelSocio = reembolsosPorSocio.get(socio.id) ?? 0;
      const retirosDelSocio = retirosPorSocio.get(socio.id) ?? 0;
      const saldoPendiente = Number(
        (gananciaDelSocio + reembolsosDelSocio - retirosDelSocio).toFixed(2),
      );

      return {
        socioId: socio.id,
        socioNombre: socio.nombre,
        porcentaje,
        gananciaPorManoDeObra: gananciaDelSocio,
        reembolsos: reembolsosDelSocio,
        retiros: retirosDelSocio,
        saldoPendiente,
      };
    });

    return {
      periodo,
      totalIngresos,
      totalCostosDirectos,
      gananciaTotal,
      porSocio: resultado,
    };
  }
}
