import { TrabajosService } from './trabajos.service';

describe('TrabajosService — regla crítica: participación ≠ productividad (Parte 3 §18)', () => {
  function crearPrismaMock() {
    return {
      trabajo: {
        findUnique: jest.fn().mockResolvedValue({ id: 'trabajo-1', precioFinal: null }),
        update: jest.fn(),
      },
      trabajoParticipante: {
        create: jest.fn().mockResolvedValue({ id: 'participante-1' }),
      },
      // Si el código alguna vez llegara a tocar esto, el test de abajo lo detecta.
      configuracionParticipacion: {
        create: jest.fn(),
        updateMany: jest.fn(),
      },
    } as any;
  }

  it('agregar un participante (trabajo conjunto) NUNCA llama a configuracionParticipacion', async () => {
    const prismaMock = crearPrismaMock();
    const service = new TrabajosService(prismaMock);

    await service.agregarParticipante('trabajo-1', {
      rolEnTrabajo: 'PARTICIPANTE' as any,
      usuarioId: 'adrian-id',
    });

    expect(prismaMock.trabajoParticipante.create).toHaveBeenCalled();
    expect(prismaMock.configuracionParticipacion.create).not.toHaveBeenCalled();
    expect(prismaMock.configuracionParticipacion.updateMany).not.toHaveBeenCalled();
  });

  it('agregar un colaborador externo tampoco toca la participación societaria', async () => {
    const prismaMock = crearPrismaMock();
    const service = new TrabajosService(prismaMock);

    await service.agregarParticipante('trabajo-1', {
      rolEnTrabajo: 'COLABORADOR_EXTERNO' as any,
      colaboradorExternoId: 'electricista-1',
    });

    expect(prismaMock.configuracionParticipacion.create).not.toHaveBeenCalled();
    expect(prismaMock.configuracionParticipacion.updateMany).not.toHaveBeenCalled();
  });

  it('no permite finalizar un trabajo sin precio_final', async () => {
    const prismaMock = crearPrismaMock();
    const service = new TrabajosService(prismaMock);

    await expect(
      service.actualizarEstadoOperativo('trabajo-1', { estadoOperativo: 'FINALIZADO' as any }),
    ).rejects.toThrow('No se puede finalizar un trabajo sin precio_final');
  });
});
