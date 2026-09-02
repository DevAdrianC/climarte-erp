import { Injectable, NotFoundException } from "@nestjs/common";
import { PrismaService } from "../../prisma/prisma.service";
import { CrearHerramientaDto } from "./dto/crear-herramienta.dto";
import { ActualizarHerramientaDto } from "./dto/actualizar-herramienta.dto";

@Injectable()
export class HerramientasService {
  constructor(private readonly prisma: PrismaService) {}

  crear(dto: CrearHerramientaDto) {
    return this.prisma.herramienta.create({ data: dto });
  }

  /**
   * Listado, por defecto solo herramientas activas. Pasar incluirBaja=true
   * para ver también las dadas de baja (histórico).
   */
  listar(incluirBaja = false) {
    return this.prisma.herramienta.findMany({
      where: incluirBaja ? undefined : { estado: "ACTIVA" },
      orderBy: { nombre: "asc" },
    });
  }

  async obtenerPorId(id: string) {
    const herramienta = await this.prisma.herramienta.findUnique({
      where: { id },
    });
    if (!herramienta) {
      throw new NotFoundException("Herramienta no encontrada");
    }
    return herramienta;
  }

  async actualizar(id: string, dto: ActualizarHerramientaDto) {
    await this.obtenerPorId(id); // 404 si no existe
    return this.prisma.herramienta.update({ where: { id }, data: dto });
  }

  /**
   * Baja lógica (Sprint 4: no hay borrado físico de herramientas, se
   * conserva el historial de compras/bajas).
   */
  async darDeBaja(id: string) {
    await this.obtenerPorId(id); // 404 si no existe
    return this.prisma.herramienta.update({
      where: { id },
      data: { estado: "DADA_DE_BAJA" },
    });
  }
}
