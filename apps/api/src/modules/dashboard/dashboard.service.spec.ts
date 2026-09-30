import { DashboardService } from "./dashboard.service";

describe("DashboardService — coincidencia con Liquidación (Sprint 6)", () => {
  function crearPrismaMock(overrides: Partial<Record<string, any>> = {}) {
    return {
      gastoFijo: { findMany: jest.fn().mockResolvedValue([]) },
      gastoVariable: { findMany: jest.fn().mockResolvedValue([]) },
      registroCombustible: { findMany: jest.fn().mockResolvedValue([]) },
      registroService: { findMany: jest.fn().mockResolvedValue([]) },
      trabajo: {
        count: jest.fn().mockResolvedValue(0),
        findMany: jest.fn().mockResolvedValue([]),
      },
      ...overrides,
    } as any;
  }

  function crearLiquidacionMock(resultado: any) {
    return { calcular: jest.fn().mockResolvedValue(resultado) } as any;
  }

  const liquidacionBase = {
    periodo: "2026-09",
    totalIngresos: 100000,
    totalCostosDirectos: 60000,
    gananciaTotal: 40000,
    porSocio: [],
  };

  it("usa exactamente los mismos ingresos y costos directos que Liquidación", async () => {
    const prismaMock = crearPrismaMock();
    const liquidacionMock = crearLiquidacionMock(liquidacionBase);
    const service = new DashboardService(prismaMock, liquidacionMock);

    const resultado = await service.resumen("2026-09");

    expect(resultado.ingresos).toBe(100000);
    expect(resultado.costosDirectos).toBe(60000);
    expect(liquidacionMock.calcular).toHaveBeenCalledWith("2026-09");
  });

  it("los gastos asociados a un trabajo NO se restan del resultado", async () => {
    const prismaMock = crearPrismaMock({
      gastoVariable: {
        findMany: jest.fn().mockImplementation(
          ({ where }) =>
            where.trabajoId === null
              ? Promise.resolve([{ importe: 5000 }]) // gasto general
              : Promise.resolve([{ importe: 999999 }]), // gasto de trabajo (informativo)
        ),
      },
    });
    const liquidacionMock = crearLiquidacionMock(liquidacionBase);
    const service = new DashboardService(prismaMock, liquidacionMock);

    const resultado = await service.resumen("2026-09");

    // Resultado = 100000 - 60000 - 5000 (solo el gasto general) = 35000
    expect(resultado.resultado).toBe(35000);
    // El gasto de trabajo se reporta aparte, sin afectar el resultado.
    expect(resultado.gastosAsociadosATrabajos).toBe(999999);
  });

  it("calcula el dinero pendiente de cobro sobre trabajos finalizados", async () => {
    const prismaMock = crearPrismaMock({
      trabajo: {
        count: jest.fn().mockResolvedValue(0),
        findMany: jest.fn().mockResolvedValue([
          { precioFinal: 100000, ingresos: [{ importe: 60000 }] },
          { precioFinal: 50000, ingresos: [] },
        ]),
      },
    });
    const liquidacionMock = crearLiquidacionMock(liquidacionBase);
    const service = new DashboardService(prismaMock, liquidacionMock);

    const resultado = await service.resumen("2026-09");

    // (100000 - 60000) + (50000 - 0) = 90000
    expect(resultado.pendienteDeCobro).toBe(90000);
  });

  it("rechaza un período con formato inválido", async () => {
    const prismaMock = crearPrismaMock();
    const liquidacionMock = crearLiquidacionMock(liquidacionBase);
    const service = new DashboardService(prismaMock, liquidacionMock);

    await expect(service.resumen("periodo-invalido")).rejects.toThrow();
  });
});
