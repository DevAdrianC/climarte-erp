import { apiClient } from '../../api/client';

export type EstadoComercial = 'CONSULTA' | 'PRESUPUESTO' | 'PRESUPUESTO_ENVIADO' | 'APROBADO' | 'RECHAZADO';
export type EstadoOperativo = 'PROGRAMADO' | 'EN_EJECUCION' | 'FINALIZADO' | 'CANCELADO';
export type EstadoPago = 'PENDIENTE' | 'PARCIAL' | 'COBRADO';
export type RolEnTrabajo = 'RESPONSABLE' | 'PARTICIPANTE' | 'COLABORADOR_EXTERNO';
export type TipoCosto = 'MATERIALES' | 'TRANSPORTE' | 'MANO_OBRA_EXTERNA' | 'OTRO';

export interface TipoServicio {
  id: string;
  nombre: string;
}
export interface TipoEquipo {
  id: string;
  nombre: string;
}
export interface ColaboradorExterno {
  id: string;
  nombre: string;
  telefono?: string | null;
}
export interface UsuarioBasico {
  id: string;
  nombre: string;
  email: string;
}

export interface Participante {
  id: string;
  rolEnTrabajo: RolEnTrabajo;
  usuario?: UsuarioBasico | null;
  colaboradorExterno?: ColaboradorExterno | null;
  horasDedicadas?: string | null;
}

export interface Costo {
  id: string;
  tipo: TipoCosto;
  importe: string;
  descripcion?: string | null;
  pagadoPor?: UsuarioBasico | null;
  comprobanteUrl?: string | null;
}

export interface Trabajo {
  id: string;
  cliente: { id: string; nombre: string };
  tipoEquipo: TipoEquipo;
  tipoServicio: TipoServicio;
  fecha: string;
  descripcion?: string | null;
  estadoComercial: EstadoComercial;
  estadoOperativo: EstadoOperativo;
  estadoPago: EstadoPago;
  precioPresupuestado?: string | null;
  precioFinal?: string | null;
  formaPago?: string | null;
  garantiaDias: number;
  observaciones?: string | null;
  participantes: Participante[];
  costos: Costo[];
}

export interface TrabajoFormValues {
  clienteId: string;
  tipoEquipoId: string;
  tipoServicioId: string;
  descripcion?: string;
  precioPresupuestado?: number;
  formaPago?: string;
  garantiaDias?: number;
  observaciones?: string;
}

export const ESTADOS_COMERCIALES: EstadoComercial[] = [
  'CONSULTA',
  'PRESUPUESTO',
  'PRESUPUESTO_ENVIADO',
  'APROBADO',
  'RECHAZADO',
];
export const ESTADOS_OPERATIVOS: EstadoOperativo[] = [
  'PROGRAMADO',
  'EN_EJECUCION',
  'FINALIZADO',
  'CANCELADO',
];

export async function listarTrabajos(filtros?: {
  estadoComercial?: string;
  estadoOperativo?: string;
}): Promise<Trabajo[]> {
  const { data } = await apiClient.get<Trabajo[]>('/trabajos', { params: filtros });
  return data;
}

export async function obtenerTrabajo(id: string): Promise<Trabajo> {
  const { data } = await apiClient.get<Trabajo>(`/trabajos/${id}`);
  return data;
}

export async function crearTrabajo(valores: TrabajoFormValues): Promise<Trabajo> {
  const { data } = await apiClient.post<Trabajo>('/trabajos', valores);
  return data;
}

export async function cambiarEstadoComercial(id: string, estadoComercial: EstadoComercial) {
  const { data } = await apiClient.patch<Trabajo>(`/trabajos/${id}/estado-comercial`, {
    estadoComercial,
  });
  return data;
}

export async function cambiarEstadoOperativo(id: string, estadoOperativo: EstadoOperativo) {
  const { data } = await apiClient.patch<Trabajo>(`/trabajos/${id}/estado-operativo`, {
    estadoOperativo,
  });
  return data;
}

export async function finalizarTrabajo(id: string, precioFinal: number) {
  const { data } = await apiClient.patch<Trabajo>(`/trabajos/${id}/finalizar`, { precioFinal });
  return data;
}

export async function agregarParticipante(
  trabajoId: string,
  valores: { rolEnTrabajo: RolEnTrabajo; usuarioId?: string; colaboradorExternoId?: string },
) {
  const { data } = await apiClient.post(`/trabajos/${trabajoId}/participantes`, valores);
  return data;
}

export async function quitarParticipante(trabajoId: string, participanteId: string) {
  await apiClient.delete(`/trabajos/${trabajoId}/participantes/${participanteId}`);
}

export async function agregarCosto(
  trabajoId: string,
  valores: { tipo: TipoCosto; importe: number; descripcion?: string; pagadoPorId?: string },
) {
  const { data } = await apiClient.post(`/trabajos/${trabajoId}/costos`, valores);
  return data;
}

export async function quitarCosto(trabajoId: string, costoId: string) {
  await apiClient.delete(`/trabajos/${trabajoId}/costos/${costoId}`);
}

// Catálogos
export async function listarTiposServicio(): Promise<TipoServicio[]> {
  const { data } = await apiClient.get<TipoServicio[]>('/tipos-servicio');
  return data;
}
export async function listarTiposEquipo(): Promise<TipoEquipo[]> {
  const { data } = await apiClient.get<TipoEquipo[]>('/tipos-equipo');
  return data;
}
export async function listarColaboradoresExternos(): Promise<ColaboradorExterno[]> {
  const { data } = await apiClient.get<ColaboradorExterno[]>('/colaboradores-externos');
  return data;
}
export async function crearColaboradorExterno(nombre: string): Promise<ColaboradorExterno> {
  const { data } = await apiClient.post<ColaboradorExterno>('/colaboradores-externos', { nombre });
  return data;
}
export async function listarUsuarios(): Promise<UsuarioBasico[]> {
  const { data } = await apiClient.get<UsuarioBasico[]>('/usuarios');
  return data;
}
