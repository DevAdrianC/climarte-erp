import { BadRequestException, Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CrearConfiguracionParticipacionDto } from './dto/crear-configuracion-participacion.dto';

@Injectable()
export class SociosService {
  constructor(private readonly prisma: PrismaService) {}

  /** Configuración vigente hoy (o en una fecha dada). */
  async obtenerVigente(fecha: Date = new Date()) {
    return this.prisma.configuracionParticipacion.findMany({
      where: {
        vigenteDesde: { lte: fecha },
        OR: [{ vigenteHasta: null }, { vigenteHasta: { gte: fecha } }],
      },
      include: { socio: { select: { id: true, nombre: true } } },
      orderBy: { socio: { nombre: 'asc' } },
    });
  }

  async listarHistorial() {
    return this.prisma.configuracionParticipacion.findMany({
      include: { socio: { select: { id: true, nombre: true } } },
      orderBy: { vigenteDesde: 'desc' },
    });
  }

  /**
   * Crea una nueva versión de la participación societaria (Parte 1 §1.1/§12):
   * exige que sume exactamente 100% entre todos los socios incluidos, y cierra
   * automáticamente la configuración anterior a la fecha de vigencia nueva.
   *
   * Esta es la ÚNICA forma en que el sistema modifica la participación societaria.
   * Ningún otro módulo (Trabajos, etc.) puede escribir en esta tabla (Parte 3 §7/§8).
   */
  async crearNuevaConfiguracion(dto: CrearConfiguracionParticipacionDto, creadoPorId: string) {
    const sumaPorcentajes = dto.participaciones.reduce((acc, p) => acc + p.porcentaje, 0);
    if (Math.abs(sumaPorcentajes - 100) > 0.01) {
      throw new BadRequestException(
        `La suma de porcentajes debe ser 100. Recibido: ${sumaPorcentajes}`,
      );
    }

    const vigenteDesde = new Date(dto.vigenteDesde);
    const vigenteHastaAnterior = new Date(vigenteDesde);
    vigenteHastaAnterior.setDate(vigenteHastaAnterior.getDate() - 1);

    return this.prisma.$transaction(async (tx) => {
      // Cierra cualquier configuración todavía abierta antes de la nueva fecha de vigencia.
      await tx.configuracionParticipacion.updateMany({
        where: { vigenteHasta: null },
        data: { vigenteHasta: vigenteHastaAnterior },
      });

      return Promise.all(
        dto.participaciones.map((p) =>
          tx.configuracionParticipacion.create({
            data: {
              socioId: p.socioId,
              porcentaje: p.porcentaje,
              vigenteDesde,
              creadoPorId,
            },
          }),
        ),
      );
    });
  }
}
