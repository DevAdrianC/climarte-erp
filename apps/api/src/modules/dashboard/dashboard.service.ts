import { Injectable, BadRequestException } from "@nestjs/common";
import { PrismaService } from "../../prisma/prisma.service";
import { LiquidacionService } from "../liquidacion/liquidacion.service";

@Injectable()
export class DashboardService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly liquidacionService: LiquidacionService,
  ) {}

  private rangoDelPeriodo(periodo: string) {
    const [anio, mes] = periodo.split("-").map(Number);
    if (!anio || !mes) {
      throw new BadRequestException(
        "Período inválido, formato esperado YYYY-MM",
      );
    }
    return { gte: new Date(anio, mes - 1, 1), lt: new Date(anio, mes, 1) };
  }

  async resumen(periodo: string) {
    const fecha = this.rangoDelPeriodo(periodo);

    // Reutiliza el mismo cálculo que Liquidación, para que las cifras coincidan
    // entre pantallas (Sprint 6, decisión de alcance).
    const liquidacion = await this.liquidacionService.calcular(periodo);

    // ---------- Gastos generales del mes ----------
    const gastosFijos = await this.prisma.gastoFijo.findMany({
      where: { activo: true },
    });
    const totalGastosFijos = gastosFijos.reduce(
      (acc, g) => acc + Number(g.importeMensual),
      0,
    );

    const gastosVariablesGenerales = await this.prisma.gastoVariable.findMany({
      where: { fecha, trabajoId: null },
    });
    const totalGastosVariablesGenerales = gastosVariablesGenerales.reduce(
      (acc, g) => acc + Number(g.importe),
      0,
    );

    const combustibleGeneral = await this.prisma.registroCombustible.findMany({
      where: { fecha, trabajoId: null },
    });
    const totalCombustibleGeneral = combustibleGeneral.reduce(
      (acc, c) => acc + Number(c.importe),
      0,
    );

    const services = await this.prisma.registroService.findMany({
      where: { fecha },
    });
    const totalServices = services.reduce(
      (acc, s) => acc + Number(s.importeAtribuido),
      0,
    );

    const totalGastosGenerales =
      totalGastosFijos +
      totalGastosVariablesGenerales +
      totalCombustibleGeneral +
      totalServices;

    // ---------- Gastos asociados a trabajos (informativo, NO entra en el resultado) ----------
    const gastosVariablesDeTrabajo = await this.prisma.gastoVariable.findMany({
      where: { fecha, trabajoId: { not: null } },
    });
    const combustibleDeTrabajo = await this.prisma.registroCombustible.findMany(
      {
        where: { fecha, trabajoId: { not: null } },
      },
    );
    const totalGastosAsociadosATrabajos =
      gastosVariablesDeTrabajo.reduce((acc, g) => acc + Number(g.importe), 0) +
      combustibleDeTrabajo.reduce((acc, c) => acc + Number(c.importe), 0);

    // ---------- Trabajos del período ----------
    const trabajosFinalizados = await this.prisma.trabajo.count({
      where: { estadoOperativo: "FINALIZADO", fecha },
    });
    const trabajosPendientes = await this.prisma.trabajo.count({
      where: { estadoOperativo: { in: ["PROGRAMADO", "EN_EJECUCION"] } },
    });
    const presupuestosPendientes = await this.prisma.trabajo.count({
      where: {
        estadoComercial: { in: ["PRESUPUESTO", "PRESUPUESTO_ENVIADO"] },
      },
    });

    // ---------- Dinero pendiente de cobro ----------
    const trabajosCobrables = await this.prisma.trabajo.findMany({
      where: { estadoOperativo: "FINALIZADO", precioFinal: { not: null } },
      include: { ingresos: true },
    });
    const pendienteDeCobro = trabajosCobrables.reduce((acc, t) => {
      const cobrado = t.ingresos.reduce((a, i) => a + Number(i.importe), 0);
      return acc + (Number(t.precioFinal) - cobrado);
    }, 0);

    const resultado =
      liquidacion.totalIngresos -
      liquidacion.totalCostosDirectos -
      totalGastosGenerales;

    return {
      periodo,
      ingresos: liquidacion.totalIngresos,
      costosDirectos: liquidacion.totalCostosDirectos,
      gastos: {
        fijos: totalGastosFijos,
        variables:
          totalGastosVariablesGenerales +
          totalCombustibleGeneral +
          totalServices,
        total: totalGastosGenerales,
      },
      gastosAsociadosATrabajos: totalGastosAsociadosATrabajos, // informativo, fuera del resultado
      resultado,
      trabajos: {
        finalizados: trabajosFinalizados,
        pendientes: trabajosPendientes,
        presupuestosPendientes,
      },
      pendienteDeCobro,
      resultadoPorSocio: liquidacion.porSocio,
      inversionPublicidad: 0, // Campañas fuera del MVP
    };
  }
}
