import { apiClient } from "../../api/client";

export interface Vehiculo {
  id: string;
  marca: string;
  modelo: string;
  patente: string;
}

export type VehiculoFormValues = Pick<Vehiculo, "marca" | "modelo" | "patente">;

export interface RegistroCombustible {
  id: string;
  fecha: string;
  litros?: string | null;
  importe: string;
  trabajoId?: string | null;
}

export type RegistroCombustibleFormValues = {
  fecha?: string;
  litros?: number;
  importe: number;
  trabajoId?: string;
};

export interface RegistroService {
  id: string;
  fecha: string;
  descripcion: string;
  importeTotal: string;
  porcentajeAtribuido: string;
  importeAtribuido: string;
}

export type RegistroServiceFormValues = {
  descripcion: string;
  fecha?: string;
  importeTotal: number;
  porcentajeAtribuido: number;
};

export async function listarVehiculos(): Promise<Vehiculo[]> {
  const { data } = await apiClient.get<Vehiculo[]>("/vehiculos");
  return data;
}

export async function crearVehiculo(
  valores: VehiculoFormValues,
): Promise<Vehiculo> {
  const { data } = await apiClient.post<Vehiculo>("/vehiculos", valores);
  return data;
}

export async function listarCombustible(
  vehiculoId: string,
): Promise<RegistroCombustible[]> {
  const { data } = await apiClient.get<RegistroCombustible[]>(
    `/vehiculos/${vehiculoId}/combustible`,
  );
  return data;
}

export async function agregarCombustible(
  vehiculoId: string,
  valores: RegistroCombustibleFormValues,
): Promise<RegistroCombustible> {
  const { data } = await apiClient.post<RegistroCombustible>(
    `/vehiculos/${vehiculoId}/combustible`,
    valores,
  );
  return data;
}

export async function listarService(
  vehiculoId: string,
): Promise<RegistroService[]> {
  const { data } = await apiClient.get<RegistroService[]>(
    `/vehiculos/${vehiculoId}/service`,
  );
  return data;
}

export async function agregarService(
  vehiculoId: string,
  valores: RegistroServiceFormValues,
): Promise<RegistroService> {
  const { data } = await apiClient.post<RegistroService>(
    `/vehiculos/${vehiculoId}/service`,
    valores,
  );
  return data;
}
