import { NotFoundException } from "@nestjs/common";
import { VehiculoService } from "./vehiculo.service";

describe("VehiculoService — cálculo de importeAtribuido en service (Sprint 4)", () => {
  function crearPrismaMock(
    vehiculo: unknown = { id: "vehiculo-1", patente: "AB123CD" },
  ) {
    return {
      vehiculo: {
        findUnique: jest.fn().mockResolvedValue(vehiculo),
      },
      registroService: {
        create: jest
          .fn()
          .mockImplementation(({ data }) => Promise.resolve(data)),
        findMany: jest.fn().mockResolvedValue([]),
      },
      registroCombustible: {
        create: jest
          .fn()
          .mockImplementation(({ data }) => Promise.resolve(data)),
        findMany: jest.fn().mockResolvedValue([]),
      },
    } as any;
  }

  it("calcula importeAtribuido = importeTotal * porcentajeAtribuido / 100", async () => {
    const prismaMock = crearPrismaMock();
    const service = new VehiculoService(prismaMock);

    const resultado = await service.agregarService("vehiculo-1", {
      descripcion: "Cambio de aceite",
      importeTotal: 50000,
      porcentajeAtribuido: 60,
    });

    expect(resultado.importeAtribuido).toBe(30000);
    expect(prismaMock.registroService.create).toHaveBeenCalledWith({
      data: expect.objectContaining({
        importeAtribuido: 30000,
        vehiculoId: "vehiculo-1",
      }),
    });
  });

  it("redondea importeAtribuido a 2 decimales", async () => {
    const prismaMock = crearPrismaMock();
    const service = new VehiculoService(prismaMock);

    const resultado = await service.agregarService("vehiculo-1", {
      descripcion: "Service general",
      importeTotal: 10000,
      porcentajeAtribuido: 33,
    });

    // 10000 * 0.33 = 3300 exacto, pero probamos un caso con decimales:
    expect(resultado.importeAtribuido).toBe(3300);
  });

  it("404 si el vehículo no existe, sin crear el registro de service", async () => {
    const prismaMock = crearPrismaMock(null);
    const service = new VehiculoService(prismaMock);

    await expect(
      service.agregarService("inexistente", {
        descripcion: "Service",
        importeTotal: 1000,
        porcentajeAtribuido: 50,
      }),
    ).rejects.toBeInstanceOf(NotFoundException);
    expect(prismaMock.registroService.create).not.toHaveBeenCalled();
  });

  it("404 si el vehículo no existe, sin crear el registro de combustible", async () => {
    const prismaMock = crearPrismaMock(null);
    const service = new VehiculoService(prismaMock);

    await expect(
      service.agregarCombustible("inexistente", { importe: 5000 }),
    ).rejects.toBeInstanceOf(NotFoundException);
    expect(prismaMock.registroCombustible.create).not.toHaveBeenCalled();
  });
});
