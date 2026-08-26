import { apiClient } from '../../api/client';
import type {
  EstadoComercial,
  EstadoOperativo,
  EstadoPago,
  TipoEquipo,
  TipoServicio,
} from '../trabajos/trabajos.api';

export interface Cliente {
  id: string;
  nombre: string;
  telefono: string;
  whatsapp?: string | null;
  direccion?: string | null;
  localidad?: string | null;
  observaciones?: string | null;
  creadoEn: string;
}

export type ClienteFormValues = Pick<
  Cliente,
  'nombre' | 'telefono' | 'whatsapp' | 'direccion' | 'localidad' | 'observaciones'
>;

export async function listarClientes(busqueda?: string): Promise<Cliente[]> {
  const { data } = await apiClient.get<Cliente[]>('/clientes', {
    params: busqueda ? { q: busqueda } : undefined,
  });
  return data;
}

export async function obtenerCliente(id: string): Promise<Cliente> {
  const { data } = await apiClient.get<Cliente>(`/clientes/${id}`);
  return data;
}

export async function crearCliente(valores: ClienteFormValues): Promise<Cliente> {
  const { data } = await apiClient.post<Cliente>('/clientes', valores);
  return data;
}

export async function actualizarCliente(
  id: string,
  valores: Partial<ClienteFormValues>,
): Promise<Cliente> {
  const { data } = await apiClient.patch<Cliente>(`/clientes/${id}`, valores);
  return data;
}

/**
 * Trabajo tal como lo devuelve `GET /clientes/:id/trabajos`: sin el cliente
 * (ya se conoce por la ruta) ni participantes/costos (son del detalle).
 */
export interface TrabajoDelCliente {
  id: string;
  fecha: string;
  descripcion?: string | null;
  tipoEquipo: TipoEquipo;
  tipoServicio: TipoServicio;
  estadoComercial: EstadoComercial;
  estadoOperativo: EstadoOperativo;
  estadoPago: EstadoPago;
  precioPresupuestado?: string | null;
  precioFinal?: string | null;
}

export async function historialDeTrabajos(id: string): Promise<TrabajoDelCliente[]> {
  const { data } = await apiClient.get<TrabajoDelCliente[]>(`/clientes/${id}/trabajos`);
  return data;
}
