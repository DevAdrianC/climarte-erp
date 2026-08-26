import { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Badge } from '../../components/Badge';
import { AgregarParticipanteForm } from './AgregarParticipanteForm';
import { AgregarCostoForm } from './AgregarCostoForm';
import {
  ESTADOS_COMERCIALES,
  ESTADOS_OPERATIVOS,
  agregarCosto,
  agregarParticipante,
  cambiarEstadoComercial,
  cambiarEstadoOperativo,
  finalizarTrabajo,
  obtenerTrabajo,
  quitarCosto,
  quitarParticipante,
} from './trabajos.api';
import {
  COLOR_ESTADO_COMERCIAL,
  COLOR_ESTADO_OPERATIVO,
  COLOR_ESTADO_PAGO,
  TEXTO_ESTADO_COMERCIAL,
  TEXTO_ESTADO_OPERATIVO,
  TEXTO_ESTADO_PAGO,
  TEXTO_ROL_TRABAJO,
  TEXTO_TIPO_COSTO,
  formatearMonto,
} from './estados.helpers';

export function TrabajoDetallePage() {
  const { id } = useParams<{ id: string }>();
  const queryClient = useQueryClient();
  const [precioFinalInput, setPrecioFinalInput] = useState('');

  const { data: trabajo, isLoading } = useQuery({
    queryKey: ['trabajos', id],
    queryFn: () => obtenerTrabajo(id!),
    enabled: !!id,
  });

  function invalidar() {
    queryClient.invalidateQueries({ queryKey: ['trabajos', id] });
    queryClient.invalidateQueries({ queryKey: ['trabajos'] });
  }

  const { mutateAsync: mutarEstadoComercial } = useMutation({
    mutationFn: (estado: string) => cambiarEstadoComercial(id!, estado as any),
    onSuccess: invalidar,
  });
  const { mutateAsync: mutarEstadoOperativo, error: errorEstadoOperativo } = useMutation({
    mutationFn: (estado: string) => cambiarEstadoOperativo(id!, estado as any),
    onSuccess: invalidar,
  });
  const { mutateAsync: mutarFinalizar, isPending: finalizando } = useMutation({
    mutationFn: (precioFinal: number) => finalizarTrabajo(id!, precioFinal),
    onSuccess: () => {
      invalidar();
      setPrecioFinalInput('');
    },
  });
  const { mutateAsync: mutarAgregarParticipante, isPending: guardandoParticipante } = useMutation({
    mutationFn: (valores: Parameters<typeof agregarParticipante>[1]) =>
      agregarParticipante(id!, valores),
    onSuccess: invalidar,
  });
  const { mutateAsync: mutarQuitarParticipante } = useMutation({
    mutationFn: (participanteId: string) => quitarParticipante(id!, participanteId),
    onSuccess: invalidar,
  });
  const { mutateAsync: mutarAgregarCosto, isPending: guardandoCosto } = useMutation({
    mutationFn: (valores: Parameters<typeof agregarCosto>[1]) => agregarCosto(id!, valores),
    onSuccess: invalidar,
  });
  const { mutateAsync: mutarQuitarCosto } = useMutation({
    mutationFn: (costoId: string) => quitarCosto(id!, costoId),
    onSuccess: invalidar,
  });

  if (isLoading) return <p className="text-sm text-gray-400">Cargando...</p>;
  if (!trabajo) return <p className="text-sm text-red-600">Trabajo no encontrado.</p>;

  const totalCostos = trabajo.costos.reduce((acc, c) => acc + Number(c.importe), 0);
  const puedeFinalizar = trabajo.estadoOperativo !== 'FINALIZADO';

  return (
    <div className="space-y-6">
      <Link to="/trabajos" className="text-sm text-climarte-dark hover:underline">
        ← Volver a trabajos
      </Link>

      <div>
        <h2 className="text-xl font-semibold text-gray-800">
          {trabajo.tipoServicio.nombre} · {trabajo.tipoEquipo.nombre}
        </h2>
        <p className="text-sm text-gray-500">
          Cliente:{' '}
          <Link to={`/clientes/${trabajo.cliente.id}`} className="text-climarte-dark hover:underline">
            {trabajo.cliente.nombre}
          </Link>{' '}
          · {new Date(trabajo.fecha).toLocaleDateString('es-AR')}
        </p>
      </div>

      {/* Estados */}
      <div className="grid grid-cols-1 gap-4 rounded-xl border border-gray-200 bg-white p-6 sm:grid-cols-3">
        <div>
          <p className="mb-1 text-xs uppercase tracking-wide text-gray-400">Estado comercial</p>
          <div className="mb-2">
            <Badge
              texto={TEXTO_ESTADO_COMERCIAL[trabajo.estadoComercial]}
              color={COLOR_ESTADO_COMERCIAL[trabajo.estadoComercial]}
            />
          </div>
          <select
            value={trabajo.estadoComercial}
            onChange={(e) => mutarEstadoComercial(e.target.value)}
            className="w-full rounded-md border border-gray-300 px-2 py-1.5 text-sm"
          >
            {ESTADOS_COMERCIALES.map((e) => (
              <option key={e} value={e}>
                {TEXTO_ESTADO_COMERCIAL[e]}
              </option>
            ))}
          </select>
        </div>

        <div>
          <p className="mb-1 text-xs uppercase tracking-wide text-gray-400">Estado operativo</p>
          <div className="mb-2">
            <Badge
              texto={TEXTO_ESTADO_OPERATIVO[trabajo.estadoOperativo]}
              color={COLOR_ESTADO_OPERATIVO[trabajo.estadoOperativo]}
            />
          </div>
          <select
            value={trabajo.estadoOperativo}
            onChange={(e) => mutarEstadoOperativo(e.target.value)}
            className="w-full rounded-md border border-gray-300 px-2 py-1.5 text-sm"
          >
            {ESTADOS_OPERATIVOS.filter((e) => e !== 'FINALIZADO').map((e) => (
              <option key={e} value={e}>
                {TEXTO_ESTADO_OPERATIVO[e]}
              </option>
            ))}
            {trabajo.estadoOperativo === 'FINALIZADO' && (
              <option value="FINALIZADO">{TEXTO_ESTADO_OPERATIVO.FINALIZADO}</option>
            )}
          </select>
          {errorEstadoOperativo && (
            <p className="mt-1 text-xs text-red-600">
              No se puede finalizar sin cargar el precio final (usá el cuadro de abajo).
            </p>
          )}
        </div>

        <div>
          <p className="mb-1 text-xs uppercase tracking-wide text-gray-400">Estado de pago</p>
          <Badge texto={TEXTO_ESTADO_PAGO[trabajo.estadoPago]} color={COLOR_ESTADO_PAGO[trabajo.estadoPago]} />
          <p className="mt-2 text-xs text-gray-400">
            El cobro se registra en el Sprint 5 (Ingresos y Liquidación mensual).
          </p>
        </div>
      </div>

      {/* Precio y garantía */}
      <div className="grid grid-cols-2 gap-4 rounded-xl border border-gray-200 bg-white p-6 sm:grid-cols-4">
        <Dato label="Precio presupuestado" valor={formatearMonto(trabajo.precioPresupuestado)} />
        <Dato label="Precio final" valor={formatearMonto(trabajo.precioFinal)} />
        <Dato label="Garantía" valor={`${trabajo.garantiaDias} días`} />
        <Dato label="Forma de pago" valor={trabajo.formaPago} />
      </div>

      {puedeFinalizar && (
        <div className="rounded-xl border border-dashed border-climarte/50 bg-climarte/5 p-6">
          <h3 className="mb-2 text-sm font-semibold text-climarte-dark">Finalizar trabajo</h3>
          <p className="mb-3 text-xs text-gray-500">
            El precio final puede diferir del presupuestado por trabajos agregados en el momento.
          </p>
          <div className="flex items-center gap-2">
            <input
              type="number"
              step="0.01"
              placeholder="Precio final"
              value={precioFinalInput}
              onChange={(e) => setPrecioFinalInput(e.target.value)}
              className="w-40 rounded-md border border-gray-300 px-3 py-2 text-sm"
            />
            <button
              disabled={finalizando || !precioFinalInput}
              onClick={() => mutarFinalizar(Number(precioFinalInput))}
              className="rounded-md bg-climarte px-4 py-2 text-sm font-semibold text-white hover:bg-climarte-dark disabled:opacity-50"
            >
              {finalizando ? 'Finalizando...' : 'Finalizar'}
            </button>
          </div>
        </div>
      )}

      {/* Participantes */}
      <div className="rounded-xl border border-gray-200 bg-white p-6">
        <h3 className="mb-3 text-sm font-semibold uppercase tracking-wide text-gray-500">
          Participantes
        </h3>
        <div className="mb-4 space-y-2">
          {trabajo.participantes.length === 0 && (
            <p className="text-sm text-gray-400">Todavía no hay participantes cargados.</p>
          )}
          {trabajo.participantes.map((p) => (
            <div key={p.id} className="flex items-center justify-between rounded-md bg-gray-50 px-3 py-2 text-sm">
              <span>
                <span className="font-medium">
                  {p.usuario?.nombre ?? p.colaboradorExterno?.nombre}
                </span>{' '}
                <span className="text-gray-500">— {TEXTO_ROL_TRABAJO[p.rolEnTrabajo]}</span>
              </span>
              <button
                onClick={() => mutarQuitarParticipante(p.id)}
                className="text-xs text-red-500 hover:underline"
              >
                Quitar
              </button>
            </div>
          ))}
        </div>
        <AgregarParticipanteForm onAgregar={mutarAgregarParticipante} guardando={guardandoParticipante} />
      </div>

      {/* Costos */}
      <div className="rounded-xl border border-gray-200 bg-white p-6">
        <div className="mb-3 flex items-center justify-between">
          <h3 className="text-sm font-semibold uppercase tracking-wide text-gray-500">
            Costos directos
          </h3>
          <span className="text-sm font-medium text-gray-700">
            Total: {formatearMonto(String(totalCostos))}
          </span>
        </div>
        <div className="mb-4 space-y-2">
          {trabajo.costos.length === 0 && (
            <p className="text-sm text-gray-400">Todavía no hay costos cargados.</p>
          )}
          {trabajo.costos.map((c) => (
            <div key={c.id} className="flex items-center justify-between rounded-md bg-gray-50 px-3 py-2 text-sm">
              <span>
                <span className="font-medium">{TEXTO_TIPO_COSTO[c.tipo]}</span>{' '}
                <span className="text-gray-500">
                  — {formatearMonto(c.importe)}
                  {c.descripcion ? ` · ${c.descripcion}` : ''}
                  {c.pagadoPor ? ` · pagado por ${c.pagadoPor.nombre}` : ''}
                </span>
              </span>
              <button
                onClick={() => mutarQuitarCosto(c.id)}
                className="text-xs text-red-500 hover:underline"
              >
                Quitar
              </button>
            </div>
          ))}
        </div>
        <AgregarCostoForm onAgregar={mutarAgregarCosto} guardando={guardandoCosto} />
      </div>
    </div>
  );
}

function Dato({ label, valor }: { label: string; valor?: string | null }) {
  return (
    <div>
      <p className="text-xs uppercase tracking-wide text-gray-400">{label}</p>
      <p className="text-sm text-gray-800">{valor || '—'}</p>
    </div>
  );
}
