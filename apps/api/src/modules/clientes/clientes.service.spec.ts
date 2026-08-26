import { NotFoundException } from '@nestjs/common';
import { ClientesService } from './clientes.service';

describe('ClientesService — historial de trabajos (Parte 2 §2)', () => {
  function crearPrismaMock(cliente: unknown = { id: 'cliente-1', nombre: 'Perez' }) {
    return {
      cliente: {
        findUnique: jest.fn().mockResolvedValue(cliente),
      },
      trabajo: {
        findMany: jest.fn().mockResolvedValue([{ id: 'trabajo-1' }]),
      },
    } as any;
  }

  it('devuelve los trabajos del cliente, del más reciente al más viejo', async () => {
    const prismaMock = crearPrismaMock();
    const service = new ClientesService(prismaMock);

    const trabajos = await service.historialDeTrabajos('cliente-1');

    expect(trabajos).toEqual([{ id: 'trabajo-1' }]);
    expect(prismaMock.trabajo.findMany).toHaveBeenCalledWith({
      where: { clienteId: 'cliente-1' },
      include: { tipoEquipo: true, tipoServicio: true },
      orderBy: { fecha: 'desc' },
    });
  });

  it('404 si el cliente no existe, sin consultar trabajos', async () => {
    const prismaMock = crearPrismaMock(null);
    const service = new ClientesService(prismaMock);

    await expect(service.historialDeTrabajos('inexistente')).rejects.toBeInstanceOf(
      NotFoundException,
    );
    expect(prismaMock.trabajo.findMany).not.toHaveBeenCalled();
  });
});
