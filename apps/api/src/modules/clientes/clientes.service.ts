import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CrearClienteDto } from './dto/crear-cliente.dto';
import { ActualizarClienteDto } from './dto/actualizar-cliente.dto';

@Injectable()
export class ClientesService {
  constructor(private readonly prisma: PrismaService) {}

  crear(dto: CrearClienteDto) {
    return this.prisma.cliente.create({ data: dto });
  }

  /**
   * Listado con búsqueda opcional por nombre, teléfono o localidad (Parte 2 §2).
   */
  listar(busqueda?: string) {
    return this.prisma.cliente.findMany({
      where: busqueda
        ? {
            OR: [
              { nombre: { contains: busqueda, mode: 'insensitive' } },
              { telefono: { contains: busqueda, mode: 'insensitive' } },
              { localidad: { contains: busqueda, mode: 'insensitive' } },
            ],
          }
        : undefined,
      orderBy: { nombre: 'asc' },
    });
  }

  async obtenerPorId(id: string) {
    const cliente = await this.prisma.cliente.findUnique({ where: { id } });
    if (!cliente) {
      throw new NotFoundException('Cliente no encontrado');
    }
    return cliente;
  }

  async actualizar(id: string, dto: ActualizarClienteDto) {
    await this.obtenerPorId(id); // 404 si no existe
    return this.prisma.cliente.update({ where: { id }, data: dto });
  }

  /**
   * Historial de trabajos del cliente (Parte 2 §2: "¿qué trabajos hicimos antes
   * a este cliente?"). El modelo Trabajo se agrega recién en el Sprint 3 — hasta
   * entonces, esta consulta siempre devuelve vacío, a propósito.
   */
  async historialDeTrabajos(id: string) {
    await this.obtenerPorId(id); // 404 si no existe
    return [] as unknown[];
  }
}
