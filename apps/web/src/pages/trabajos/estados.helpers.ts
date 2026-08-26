import { EstadoComercial, EstadoOperativo, EstadoPago } from './trabajos.api';

export const TEXTO_ESTADO_COMERCIAL: Record<EstadoComercial, string> = {
  CONSULTA: 'Consulta',
  PRESUPUESTO: 'Presupuesto',
  PRESUPUESTO_ENVIADO: 'Presupuesto enviado',
  APROBADO: 'Aprobado',
  RECHAZADO: 'Rechazado',
};

export const TEXTO_ESTADO_OPERATIVO: Record<EstadoOperativo, string> = {
  PROGRAMADO: 'Programado',
  EN_EJECUCION: 'En ejecución',
  FINALIZADO: 'Finalizado',
  CANCELADO: 'Cancelado',
};

export const TEXTO_ESTADO_PAGO: Record<EstadoPago, string> = {
  PENDIENTE: 'Pendiente',
  PARCIAL: 'Parcial',
  COBRADO: 'Cobrado',
};

export const COLOR_ESTADO_COMERCIAL: Record<EstadoComercial, 'gray' | 'blue' | 'green' | 'red'> = {
  CONSULTA: 'gray',
  PRESUPUESTO: 'blue',
  PRESUPUESTO_ENVIADO: 'blue',
  APROBADO: 'green',
  RECHAZADO: 'red',
};

export const COLOR_ESTADO_OPERATIVO: Record<EstadoOperativo, 'gray' | 'blue' | 'green' | 'red'> = {
  PROGRAMADO: 'gray',
  EN_EJECUCION: 'blue',
  FINALIZADO: 'green',
  CANCELADO: 'red',
};

export const COLOR_ESTADO_PAGO: Record<EstadoPago, 'yellow' | 'blue' | 'green'> = {
  PENDIENTE: 'yellow',
  PARCIAL: 'blue',
  COBRADO: 'green',
};

export const TEXTO_TIPO_COSTO: Record<string, string> = {
  MATERIALES: 'Materiales',
  TRANSPORTE: 'Transporte',
  MANO_OBRA_EXTERNA: 'Mano de obra externa',
  OTRO: 'Otro',
};

export const TEXTO_ROL_TRABAJO: Record<string, string> = {
  RESPONSABLE: 'Responsable',
  PARTICIPANTE: 'Participante',
  COLABORADOR_EXTERNO: 'Colaborador externo',
};
