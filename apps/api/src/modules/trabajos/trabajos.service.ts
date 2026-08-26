import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { RolEnTrabajo } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { CrearTrabajoDto } from './dto/crear-trabajo.dto';
import { ActualizarEstadoComercialDto } from './dto/actualizar-estado-comercial.dto';
import { ActualizarEstadoOperativoDto } from './dto/actualizar-estado-operativo.dto';
import { FinalizarTrabajoDto } from './dto/finalizar-trabajo.dto';
import { AgregarParticipanteDto } from './dto/agregar-participante.dto';
import { AgregarCostoDto } from './dto/agregar-costo.dto';

const INCLUDE_DETALLE = {
  cliente: true,
  tipoEquipo: true,
  tipoServicio: true,
  participantes: { include: { usuario: true, colaboradorExterno: true } },
  costos: { include: { pagadoPor: true } },
} as const;

@Injectable()
export class TrabajosService {
  constructor(private readonly prisma: PrismaService) {}

  crear(dto: CrearTrabajoDto, creadoPorId: string) {
    return this.prisma.trabajo.create({
      data: {
        clienteId: dto.clienteId,
        tipoEquipoId: dto.tipoEquipoId,
        tipoServicioId: dto.tipoServicioId,
        fecha: dto.fecha ? new Date(dto.fecha) : undefined,
        descripcion: dto.descripcion,
        precioPresupuestado: dto.precioPresupuestado,
        formaPago: dto.formaPago,
        garantiaDias: dto.garantiaDias ?? 90,
        observaciones: dto.observaciones,
        creadoPorId,
      },
      include: INCLUDE_DETALLE,
    });
  }

  listar(filtros: { estadoComercial?: string; estadoOperativo?: string; clienteId?: string }) {
    return this.prisma.trabajo.findMany({
      where: {
        estadoComercial: (filtros.estadoComercial as any) || undefined,
        estadoOperativo: (filtros.estadoOperativo as any) || undefined,
        clienteId: filtros.clienteId || undefined,
      },
      include: { cliente: true, tipoEquipo: true, tipoServicio: true },
      orderBy: { fecha: 'desc' },
    });
  }

  async obtenerPorId(id: string) {
    const trabajo = await this.prisma.trabajo.findUnique({
      where: { id },
      include: INCLUDE_DETALLE,
    });
    if (!trabajo) {
      throw new NotFoundException('Trabajo no encontrado');
    }
    return trabajo;
  }

  async actualizarEstadoComercial(id: string, dto: ActualizarEstadoComercialDto) {
    await this.obtenerPorId(id);
    return this.prisma.trabajo.update({
      where: { id },
      data: { estadoComercial: dto.estadoComercial },
      include: INCLUDE_DETALLE,
    });
  }

  async actualizarEstadoOperativo(id: string, dto: ActualizarEstadoOperativoDto) {
    const trabajo = await this.obtenerPorId(id);

    // Regla técnica (Parte 3 §8): no se permite Finalizado sin precio_final.
    if (dto.estadoOperativo === 'FINALIZADO' && trabajo.precioFinal === null) {
      throw new BadRequestException(
        'No se puede finalizar un trabajo sin precio_final. Usá el endpoint de finalizar.',
      );
    }

    return this.prisma.trabajo.update({
      where: { id },
      data: { estadoOperativo: dto.estadoOperativo },
      include: INCLUDE_DETALLE,
    });
  }

  /**
   * Finaliza el trabajo: define el precio_final (que puede diferir del
   * presupuestado por trabajos agregados en el momento — Parte 2 §3.3, criterio
   * percibido ya definido) y avanza el estado_operativo a Finalizado.
   */
  async finalizar(id: string, dto: FinalizarTrabajoDto) {
    await this.obtenerPorId(id);
    return this.prisma.trabajo.update({
      where: { id },
      data: { precioFinal: dto.precioFinal, estadoOperativo: 'FINALIZADO' },
      include: INCLUDE_DETALLE,
    });
  }

  /**
   * Agrega un participante/responsable/colaborador externo al trabajo.
   *
   * REGLA NO NEGOCIABLE (Parte 1 §4/§23, Parte 3 §7/§8, testeada en socios.service.spec.ts
   * y en trabajos.service.spec.ts): esto NUNCA escribe en ConfiguracionParticipacion.
   * Participar de un trabajo es productividad individual, no participación societaria.
   */
  async agregarParticipante(trabajoId: string, dto: AgregarParticipanteDto) {
    await this.obtenerPorId(trabajoId);

    const esColaboradorExterno = dto.rolEnTrabajo === RolEnTrabajo.COLABORADOR_EXTERNO;
    if (esColaboradorExterno && !dto.colaboradorExternoId) {
      throw new BadRequestException('colaboradorExternoId es requerido para COLABORADOR_EXTERNO');
    }
    if (!esColaboradorExterno && !dto.usuarioId) {
      throw new BadRequestException('usuarioId es requerido para RESPONSABLE/PARTICIPANTE');
    }

    return this.prisma.trabajoParticipante.create({
      data: {
        trabajoId,
        rolEnTrabajo: dto.rolEnTrabajo,
        usuarioId: esColaboradorExterno ? null : dto.usuarioId,
        colaboradorExternoId: esColaboradorExterno ? dto.colaboradorExternoId : null,
        horasDedicadas: dto.horasDedicadas,
      },
      include: { usuario: true, colaboradorExterno: true },
    });
  }

  quitarParticipante(trabajoId: string, participanteId: string) {
    return this.prisma.trabajoParticipante.delete({
      where: { id: participanteId, trabajoId },
    });
  }

  /**
   * Carga un costo del trabajo. La mano de obra de los socios NUNCA pasa por
   * acá (Parte 2 §1.6, ya definido) — el enum TipoCosto no tiene esa opción.
   */
  async agregarCosto(trabajoId: string, dto: AgregarCostoDto) {
    await this.obtenerPorId(trabajoId);
    return this.prisma.costoTrabajo.create({
      data: {
        trabajoId,
        tipo: dto.tipo,
        importe: dto.importe,
        descripcion: dto.descripcion,
        pagadoPorId: dto.pagadoPorId,
        comprobanteUrl: dto.comprobanteUrl,
      },
      include: { pagadoPor: true },
    });
  }

  quitarCosto(trabajoId: string, costoId: string) {
    return this.prisma.costoTrabajo.delete({ where: { id: costoId, trabajoId } });
  }
}
