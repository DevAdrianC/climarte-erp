import { BadRequestException } from '@nestjs/common';
import { SociosService } from './socios.service';

describe('SociosService — regla crítica de participación societaria (Parte 3 §18)', () => {
  const prismaMock = {
    $transaction: jest.fn(),
    configuracionParticipacion: {
      updateMany: jest.fn(),
      create: jest.fn(),
      findFirst: jest.fn(),
      findMany: jest.fn(),
    },
  } as any;

  const service = new SociosService(prismaMock);

  it('rechaza una configuración cuya suma de porcentajes no sea 100', async () => {
    await expect(
      service.crearNuevaConfiguracion(
        {
          participaciones: [
            { socioId: 'nahuel-id', porcentaje: 60 },
            { socioId: 'adrian-id', porcentaje: 30 },
          ],
          vigenteDesde: '2026-09-01',
        },
        'nahuel-id',
      ),
    ).rejects.toBeInstanceOf(BadRequestException);
  });

  it('acepta una configuración 50/50', async () => {
    prismaMock.$transaction.mockImplementation(async (fn: any) =>
      fn({
        configuracionParticipacion: {
          updateMany: jest.fn(),
          create: jest.fn().mockResolvedValue({}),
        },
      }),
    );

    await expect(
      service.crearNuevaConfiguracion(
        {
          participaciones: [
            { socioId: 'nahuel-id', porcentaje: 50 },
            { socioId: 'adrian-id', porcentaje: 50 },
          ],
          vigenteDesde: '2026-09-01',
        },
        'nahuel-id',
      ),
    ).resolves.toBeDefined();
  });
});
