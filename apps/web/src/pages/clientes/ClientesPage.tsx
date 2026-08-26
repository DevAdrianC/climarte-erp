import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Modal } from '../../components/Modal';
import { ClienteForm } from './ClienteForm';
import { ClienteFormValues, crearCliente, listarClientes } from './clientes.api';

export function ClientesPage() {
  const [busqueda, setBusqueda] = useState('');
  const [modalAbierto, setModalAbierto] = useState(false);
  const queryClient = useQueryClient();

  const { data: clientes, isLoading } = useQuery({
    queryKey: ['clientes', busqueda],
    queryFn: () => listarClientes(busqueda || undefined),
  });

  const { mutateAsync: crear, isPending: guardando } = useMutation({
    mutationFn: crearCliente,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['clientes'] });
      setModalAbierto(false);
    },
  });

  async function handleGuardar(valores: ClienteFormValues) {
    await crear(valores);
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold text-gray-800">Clientes</h2>
        <button
          onClick={() => setModalAbierto(true)}
          className="rounded-md bg-climarte px-4 py-2 text-sm font-semibold text-white hover:bg-climarte-dark"
        >
          + Nuevo cliente
        </button>
      </div>

      <input
        type="search"
        placeholder="Buscar por nombre, teléfono o localidad..."
        value={busqueda}
        onChange={(e) => setBusqueda(e.target.value)}
        className="w-full max-w-md rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-climarte focus:outline-none focus:ring-1 focus:ring-climarte"
      />

      <div className="overflow-hidden rounded-xl border border-gray-200 bg-white">
        <table className="w-full text-left text-sm">
          <thead className="bg-gray-50 text-xs uppercase tracking-wide text-gray-500">
            <tr>
              <th className="px-4 py-3">Nombre</th>
              <th className="px-4 py-3">Teléfono</th>
              <th className="px-4 py-3">Localidad</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {isLoading && (
              <tr>
                <td colSpan={3} className="px-4 py-6 text-center text-gray-400">
                  Cargando...
                </td>
              </tr>
            )}
            {!isLoading && clientes?.length === 0 && (
              <tr>
                <td colSpan={3} className="px-4 py-6 text-center text-gray-400">
                  No hay clientes cargados todavía.
                </td>
              </tr>
            )}
            {clientes?.map((cliente) => (
              <tr key={cliente.id} className="hover:bg-gray-50">
                <td className="px-4 py-3">
                  <Link
                    to={`/clientes/${cliente.id}`}
                    className="font-medium text-climarte-dark hover:underline"
                  >
                    {cliente.nombre}
                  </Link>
                </td>
                <td className="px-4 py-3 text-gray-600">{cliente.telefono}</td>
                <td className="px-4 py-3 text-gray-600">{cliente.localidad ?? '—'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {modalAbierto && (
        <Modal titulo="Nuevo cliente" onCerrar={() => setModalAbierto(false)}>
          <ClienteForm
            onGuardar={handleGuardar}
            onCancelar={() => setModalAbierto(false)}
            guardando={guardando}
          />
        </Modal>
      )}
    </div>
  );
}
