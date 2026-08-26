import { Injectable } from "@nestjs/common";
import { PrismaService } from "../../prisma/prisma.service";

@Injectable()
export class CatalogosService {
  constructor(private readonly prisma: PrismaService) {}

  tiposServicio() {
    return this.prisma.tipoServicio.findMany({ orderBy: { nombre: "asc" } });
  }

  tiposEquipo() {
    return this.prisma.tipoEquipo.findMany({ orderBy: { nombre: "asc" } });
  }

  colaboradoresExternos() {
    return this.prisma.colaboradorExterno.findMany({
      orderBy: { nombre: "asc" },
    });
  }

  crearColaboradorExterno(data: {
    nombre: string;
    telefono?: string;
    observaciones?: string;
  }) {
    return this.prisma.colaboradorExterno.create({ data });
  }

  usuariosActivos() {
    return this.prisma.usuario.findMany({
      where: { activo: true },
      select: { id: true, nombre: true, email: true },
      orderBy: { nombre: "asc" },
    });
  }
}
