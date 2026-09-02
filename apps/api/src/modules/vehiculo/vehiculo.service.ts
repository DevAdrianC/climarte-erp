import { Injectable, NotFoundException } from "@nestjs/common";
import { PrismaService } from "../../prisma/prisma.service";
import { CrearVehiculoDto } from "./dto/crear-vehiculo.dto";
import { CrearRegistroCombustibleDto } from "./dto/crear-registro-combustible.dto";
import { CrearRegistroServiceDto } from "./dto/crear-registro-service.dto";

@Injectable()
export class VehiculoService {
  constructor(private readonly prisma: PrismaService) {}

  crear(dto: CrearVehiculoDto) {
    return this.prisma.vehiculo.create({ data: dto });
  }

  listar() {
    return this.prisma.vehiculo.findMany({ orderBy: { creadoEn: "asc" } });
  }

  async obtenerPorId(id: string) {
    const vehiculo = await this.prisma.vehiculo.findUnique({ where: { id } });
    if (!vehiculo) {
      throw new NotFoundException("Vehículo no encontrado");
    }
    return vehiculo;
  }

  // ---------- Combustible ----------

  async agregarCombustible(
    vehiculoId: string,
    dto: CrearRegistroCombustibleDto,
  ) {
    await this.obtenerPorId(vehiculoId); // 404 si el vehículo no existe
    return this.prisma.registroCombustible.create({
      data: { ...dto, vehiculoId },
    });
  }

  async listarCombustible(vehiculoId: string) {
    await this.obtenerPorId(vehiculoId);
    return this.prisma.registroCombustible.findMany({
      where: { vehiculoId },
      include: { trabajo: true },
      orderBy: { fecha: "desc" },
    });
  }

  // ---------- Service ----------

  /**
   * importeAtribuido se calcula acá, nunca se recibe del cliente
   * (Sprint 4: importeAtribuido = importeTotal * porcentajeAtribuido / 100).
   */
  async agregarService(vehiculoId: string, dto: CrearRegistroServiceDto) {
    await this.obtenerPorId(vehiculoId); // 404 si el vehículo no existe
    const importeAtribuido = Number(
      (dto.importeTotal * (dto.porcentajeAtribuido / 100)).toFixed(2),
    );
    return this.prisma.registroService.create({
      data: { ...dto, vehiculoId, importeAtribuido },
    });
  }

  async listarService(vehiculoId: string) {
    await this.obtenerPorId(vehiculoId);
    return this.prisma.registroService.findMany({
      where: { vehiculoId },
      orderBy: { fecha: "desc" },
    });
  }
}
