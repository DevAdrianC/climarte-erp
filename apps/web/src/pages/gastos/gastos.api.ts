import { apiClient } from "../../api/client";

export interface CategoriaGasto {
  id: string;
  nombre: string;
}

export interface Proveedor {
  id: string;
  nombre: string;
}

export interface GastoFijo {
  id: string;
  categoriaId: string;
  categoria: CategoriaGasto;
  importeMensual: string;
  descripcion?: string | null;
  activo: boolean;
  creadoEn: string;
}

export type GastoFijoFormValues = {
  categoriaId: string;
  importeMensual: number;
  descripcion?: string;
};

export interface GastoVariable {
  id: string;
  categoriaId: string;
  categoria: CategoriaGasto;
  proveedorId?: string | null;
  proveedor?: Proveedor | null;
  trabajoId?: string | null;
  importe: string;
  fecha: string;
  descripcion?: string | null;
  comprobanteUrl?: string | null;
}

export type GastoVariableFormValues = {
  categoriaId: string;
  proveedorId?: string;
  trabajoId?: string;
  importe: number;
  fecha?: string;
  descripcion?: string;
};

export async function listarCategorias(): Promise<CategoriaGasto[]> {
  const { data } = await apiClient.get<CategoriaGasto[]>("/categorias-gasto");
  return data;
}

export async function listarProveedores(): Promise<Proveedor[]> {
  const { data } = await apiClient.get<Proveedor[]>("/proveedores");
  return data;
}

export async function listarGastosFijos(): Promise<GastoFijo[]> {
  const { data } = await apiClient.get<GastoFijo[]>("/gastos-fijos");
  return data;
}

export async function crearGastoFijo(
  valores: GastoFijoFormValues,
): Promise<GastoFijo> {
  const { data } = await apiClient.post<GastoFijo>("/gastos-fijos", valores);
  return data;
}

export async function listarGastosVariables(): Promise<GastoVariable[]> {
  const { data } = await apiClient.get<GastoVariable[]>("/gastos-variables");
  return data;
}

export async function crearGastoVariable(
  valores: GastoVariableFormValues,
): Promise<GastoVariable> {
  const { data } = await apiClient.post<GastoVariable>(
    "/gastos-variables",
    valores,
  );
  return data;
}
