import { LiquidacionService } from "./liquidacion.service";

describe("LiquidacionService — cálculo de Liquidación mensual (Sprint 5, Parte 2 §9)", () => {
  const socioA = { id: "socio-a", nombre: "Nahuel" };
  const socioB = { id: "socio-b", nombre: "Adrian" };

  function crearPrismaMock(overrides: Partial<Record<string, any>> = {}) {
    return {
      usuario: {
        findMany: jest.fn().mockResolvedValue([socioA, socioB]),
      },
      configuracionParticipacion: {
        findMany: jest.fn().mockResolvedValue([
          { socioId: "socio-a", porcentaje: 50 },
          { socioId: "socio-b", porcentaje: 50 },
        ]),
      },
      ingreso: {
        findMany: jest.fn().mockResolvedValue([]),
      },
      costoTrabajo: {
        findMany: jest.fn().mockResolvedValue([]),
      },
      retiroSocio: {
        findMany: jest.fn().mockResolvedValue([]),
      },
      ...overrides,
    } as any;
  }

  it("reparte la ganancia por mano de obra 50/50 entre los socios", async () => {
    const prismaMock = crearPrismaMock({
      ingreso: {
        findMany: jest.fn().mockResolvedValue([
          {
            trabajoId: "trabajo-1",
            importe: 100000,
            trabajo: { costos: [{ importe: 20000 }] }, // ganancia neta: 80000
          },
        ]),
      },
    });
    const service = new LiquidacionService(prismaMock);

    const resultado = await service.calcular("2026-09");

    expect(resultado.gananciaTotal).toBe(80000);
    expect(
      resultado.porSocio.find((s) => s.socioId === "socio-a")
        ?.gananciaPorManoDeObra,
    ).toBe(40000);
    expect(
      resultado.porSocio.find((s) => s.socioId === "socio-b")
        ?.gananciaPorManoDeObra,
    ).toBe(40000);
  });

  it("NUNCA reparte los reembolsos 50/50 — se los queda entero quien pagó", async () => {
    const prismaMock = crearPrismaMock({
      costoTrabajo: {
        findMany: jest.fn().mockResolvedValue([
          { pagadoPorId: "socio-a", importe: 15000 },
          { pagadoPorId: "socio-a", importe: 5000 },
        ]),
      },
    });
    const service = new LiquidacionService(prismaMock);

    const resultado = await service.calcular("2026-09");

    const socioAResultado = resultado.porSocio.find(
      (s) => s.socioId === "socio-a",
    );
    const socioBResultado = resultado.porSocio.find(
      (s) => s.socioId === "socio-b",
    );

    // Todo el reembolso (20000) es de Nahuel, ninguna parte va a Adrián.
    expect(socioAResultado?.reembolsos).toBe(20000);
    expect(socioBResultado?.reembolsos).toBe(0);
  });

  it("no cuenta los costos de un trabajo más de una vez si tiene varios ingresos parciales", async () => {
    const mismoTrabajo = { costos: [{ importe: 10000 }] };
    const prismaMock = crearPrismaMock({
      ingreso: {
        findMany: jest.fn().mockResolvedValue([
          { trabajoId: "trabajo-1", importe: 30000, trabajo: mismoTrabajo },
          { trabajoId: "trabajo-1", importe: 20000, trabajo: mismoTrabajo },
        ]),
      },
    });
    const service = new LiquidacionService(prismaMock);

    const resultado = await service.calcular("2026-09");

    // Ingresos: 30000 + 20000 = 50000. Costos contados UNA sola vez: 10000.
    expect(resultado.totalIngresos).toBe(50000);
    expect(resultado.totalCostosDirectos).toBe(10000);
    expect(resultado.gananciaTotal).toBe(40000);
  });

  it("calcula el saldo pendiente restando los retiros ya realizados", async () => {
    const prismaMock = crearPrismaMock({
      ingreso: {
        findMany: jest
          .fn()
          .mockResolvedValue([
            {
              trabajoId: "trabajo-1",
              importe: 100000,
              trabajo: { costos: [] },
            },
          ]),
      },
      retiroSocio: {
        findMany: jest
          .fn()
          .mockResolvedValue([{ socioId: "socio-a", importe: 10000 }]),
      },
    });
    const service = new LiquidacionService(prismaMock);

    const resultado = await service.calcular("2026-09");

    // Ganancia total 100000, 50% = 50000 c/u. Nahuel ya retiró 10000 → saldo 40000.
    const socioAResultado = resultado.porSocio.find(
      (s) => s.socioId === "socio-a",
    );
    const socioBResultado = resultado.porSocio.find(
      (s) => s.socioId === "socio-b",
    );
    expect(socioAResultado?.saldoPendiente).toBe(40000);
    expect(socioBResultado?.saldoPendiente).toBe(50000);
  });

  it("rechaza un período con formato inválido", async () => {
    const prismaMock = crearPrismaMock();
    const service = new LiquidacionService(prismaMock);

    await expect(service.calcular("periodo-invalido")).rejects.toThrow();
  });
});
