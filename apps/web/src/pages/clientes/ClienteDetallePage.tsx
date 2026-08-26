import { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Modal } from '../../components/Modal';
import { ClienteForm } from './ClienteForm';
import {
  ClienteFormValues,
  actualizarCliente,
  historialDeTrabajos,
  obtenerCliente,
} from './clientes.api';

export function ClienteDetallePage() {
  const { id } = useParams<{ id: string }>();
  const [editando, setEditando] = useState(false);
  const queryClient = useQueryClient();

  const { data: cliente, isLoading } = useQuery({
    queryKey: ['clientes', id],
    queryFn: () => obtenerCliente(id!),
    enabled: !!id,
  });

  const { data: trabajos } = useQuery({
    queryKey: ['clientes', id, 'trabajos'],
    queryFn: () => historialDeTrabajos(id!),
    enabled: !!id,
  });

  const { mutateAsync: actualizar, isPending: guardando } = useMutation({
    mutationFn: (valores: ClienteFormValues) => actualizarCliente(id!, valores),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['clientes', id] });
      queryClient.invalidateQueries({ queryKey: ['clientes'] });
      setEditando(false);
    },
  });

  if (isLoading) return <p className="text-sm text-gray-400">Cargando...</p>;
  if (!cliente) return <p className="text-sm text-red-600">Cliente no encontrado.</p>;

  return (
    <div className="space-y-6">
      <Link to="/clientes" className="text-sm text-climarte-dark hover:underline">
        ← Volver a clientes
      </Link>

      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold text-gray-800">{cliente.nombre}</h2>
        <button
          onClick={() => setEditando(true)}
          className="rounded-md border border-gray-300 px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-100"
        >
          Editar
        </button>
      </div>

      <div className="grid grid-cols-2 gap-4 rounded-xl border border-gray-200 bg-white p-6 sm:grid-cols-3">
        <Dato label="Teléfono" valor={cliente.telefono} />
        <Dato label="WhatsApp" valor={cliente.whatsapp} />
        <Dato label="Localidad" valor={cliente.localidad} />
        <Dato label="Dirección" valor={cliente.direccion} />
        <div className="col-span-2 sm:col-span-3">
          <Dato label="Observaciones" valor={cliente.observaciones} />
        </div>
      </div>

      <div className="rounded-xl border border-gray-200 bg-white p-6">
        <h3 className="mb-3 text-sm font-semibold uppercase tracking-wide text-gray-500">
          Historial de trabajos
        </h3>
        {trabajos && trabajos.length === 0 && (
          <p className="text-sm text-gray-400">
            Todavía no hay trabajos registrados para este cliente. El módulo de Trabajos se
            construye en el Sprint 3.
          </p>
        )}
      </div>

      {editando && (
        <Modal titulo="Editar cliente" onCerrar={() => setEditando(false)}>
          <ClienteForm
            valoresIniciales={cliente}
            onGuardar={async (valores) => {
              await actualizar(valores);
            }}
            onCancelar={() => setEditando(false)}
            guardando={guardando}
          />
        </Modal>
      )}
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
