import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Modal } from '../../components/Modal';
import { Badge } from '../../components/Badge';
import { TrabajoForm } from './TrabajoForm';
import { ESTADOS_COMERCIALES, TrabajoFormValues, crearTrabajo, listarTrabajos } from './trabajos.api';
import { COLOR_ESTADO_COMERCIAL, COLOR_ESTADO_OPERATIVO, TEXTO_ESTADO_COMERCIAL, TEXTO_ESTADO_OPERATIVO } from './estados.helpers';

export function TrabajosPage() {
  const [filtroEstado, setFiltroEstado] = useState('');
  const [modalAbierto, setModalAbierto] = useState(false);
  const queryClient = useQueryClient();

  const { data: trabajos, isLoading } = useQuery({
    queryKey: ['trabajos', filtroEstado],
    queryFn: () => listarTrabajos(filtroEstado ? { estadoComercial: filtroEstado } : undefined),
  });

  const { mutateAsync: crear, isPending: guardando } = useMutation({
    mutationFn: crearTrabajo,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['trabajos'] });
      setModalAbierto(false);
    },
  });

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold text-gray-800">Trabajos</h2>
        <button
          onClick={() => setModalAbierto(true)}
          className="rounded-md bg-climarte px-4 py-2 text-sm font-semibold text-white hover:bg-climarte-dark"
        >
          + Nuevo trabajo
        </button>
      </div>

      <select
        value={filtroEstado}
        onChange={(e) => setFiltroEstado(e.target.value)}
        className="w-full max-w-xs rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-climarte focus:outline-none focus:ring-1 focus:ring-climarte"
      >
        <option value="">Todos los estados comerciales</option>
        {ESTADOS_COMERCIALES.map((e) => (
          <option key={e} value={e}>
            {TEXTO_ESTADO_COMERCIAL[e]}
          </option>
        ))}
      </select>

      <div className="overflow-hidden rounded-xl border border-gray-200 bg-white">
        <table className="w-full text-left text-sm">
          <thead className="bg-gray-50 text-xs uppercase tracking-wide text-gray-500">
            <tr>
              <th className="px-4 py-3">Cliente</th>
              <th className="px-4 py-3">Servicio</th>
              <th className="px-4 py-3">Estado comercial</th>
              <th className="px-4 py-3">Estado operativo</th>
              <th className="px-4 py-3">Fecha</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {isLoading && (
              <tr>
                <td colSpan={5} className="px-4 py-6 text-center text-gray-400">
                  Cargando...
                </td>
              </tr>
            )}
            {!isLoading && trabajos?.length === 0 && (
              <tr>
                <td colSpan={5} className="px-4 py-6 text-center text-gray-400">
                  No hay trabajos cargados todavía.
                </td>
              </tr>
            )}
            {trabajos?.map((t) => (
              <tr key={t.id} className="hover:bg-gray-50">
                <td className="px-4 py-3">
                  <Link to={`/trabajos/${t.id}`} className="font-medium text-climarte-dark hover:underline">
                    {t.cliente.nombre}
                  </Link>
                </td>
                <td className="px-4 py-3 text-gray-600">
                  {t.tipoServicio.nombre} · {t.tipoEquipo.nombre}
                </td>
                <td className="px-4 py-3">
                  <Badge texto={TEXTO_ESTADO_COMERCIAL[t.estadoComercial]} color={COLOR_ESTADO_COMERCIAL[t.estadoComercial]} />
                </td>
                <td className="px-4 py-3">
                  <Badge texto={TEXTO_ESTADO_OPERATIVO[t.estadoOperativo]} color={COLOR_ESTADO_OPERATIVO[t.estadoOperativo]} />
                </td>
                <td className="px-4 py-3 text-gray-600">
                  {new Date(t.fecha).toLocaleDateString('es-AR')}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {modalAbierto && (
        <Modal titulo="Nuevo trabajo" onCerrar={() => setModalAbierto(false)}>
          <TrabajoForm
            onGuardar={async (valores: TrabajoFormValues) => {
              await crear(valores);
            }}
            onCancelar={() => setModalAbierto(false)}
            guardando={guardando}
          />
        </Modal>
      )}
    </div>
  );
}
