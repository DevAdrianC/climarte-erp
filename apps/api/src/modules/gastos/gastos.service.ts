import { Injectable, NotFoundException } from "@nestjs/common";
import { PrismaService } from "../../prisma/prisma.service";
import { CrearGastoFijoDto } from "./dto/crear-gasto-fijo.dto";
import { ActualizarGastoFijoDto } from "./dto/actualizar-gasto-fijo.dto";
import { CrearGastoVariableDto } from "./dto/crear-gasto-variable.dto";
import { ActualizarGastoVariableDto } from "./dto/actualizar-gasto-variable.dto";
import { CrearProveedorDto } from "./dto/crear-proveedor.dto";

@Injectable()
export class GastosService {
  constructor(private readonly prisma: PrismaService) {}

  // ---------- Gastos fijos ----------

  crearFijo(dto: CrearGastoFijoDto) {
    return this.prisma.gastoFijo.create({ data: dto });
  }

  listarFijos() {
    return this.prisma.gastoFijo.findMany({
      where: { activo: true },
      include: { categoria: true },
      orderBy: { creadoEn: "desc" },
    });
  }

  async obtenerFijoPorId(id: string) {
    const gasto = await this.prisma.gastoFijo.findUnique({
      where: { id },
      include: { categoria: true },
    });
    if (!gasto) {
      throw new NotFoundException("Gasto fijo no encontrado");
    }
    return gasto;
  }

  async actualizarFijo(id: string, dto: ActualizarGastoFijoDto) {
    await this.obtenerFijoPorId(id); // 404 si no existe
    return this.prisma.gastoFijo.update({ where: { id }, data: dto });
  }

  // ---------- Gastos variables ----------

  /**
   * Si dto.trabajoId viene informado, el gasto queda asociado a ese trabajo
   * y se considera costo directo. Si no, es gasto general del negocio
   * (Sprint 4, regla no negociable — ver docs/sprints/sprint-4.md).
   */
  crearVariable(dto: CrearGastoVariableDto) {
    return this.prisma.gastoVariable.create({ data: dto });
  }

  /**
   * Listado con filtros opcionales por categoría y por si es costo directo
   * (asociado a un trabajo) o gasto general.
   */
  listarVariables(categoriaId?: string, soloConTrabajo?: boolean) {
    return this.prisma.gastoVariable.findMany({
      where: {
        categoriaId,
        trabajoId:
          soloConTrabajo === undefined
            ? undefined
            : soloConTrabajo
              ? { not: null }
              : null,
      },
      include: { categoria: true, proveedor: true, trabajo: true },
      orderBy: { fecha: "desc" },
    });
  }

  async obtenerVariablePorId(id: string) {
    const gasto = await this.prisma.gastoVariable.findUnique({
      where: { id },
      include: { categoria: true, proveedor: true, trabajo: true },
    });
    if (!gasto) {
      throw new NotFoundException("Gasto variable no encontrado");
    }
    return gasto;
  }

  async actualizarVariable(id: string, dto: ActualizarGastoVariableDto) {
    await this.obtenerVariablePorId(id); // 404 si no existe
    return this.prisma.gastoVariable.update({ where: { id }, data: dto });
  }

  // ---------- Proveedores ----------

  crearProveedor(dto: CrearProveedorDto) {
    return this.prisma.proveedor.create({ data: dto });
  }

  listarProveedores() {
    return this.prisma.proveedor.findMany({ orderBy: { nombre: "asc" } });
  }

  // ---------- Categorías ----------

  listarCategorias() {
    return this.prisma.categoriaGasto.findMany({ orderBy: { nombre: "asc" } });
  }
}
