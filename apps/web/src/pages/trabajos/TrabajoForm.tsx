import { useForm } from 'react-hook-form';
import { useQuery } from '@tanstack/react-query';
import { listarClientes } from '../clientes/clientes.api';
import { TrabajoFormValues, listarTiposEquipo, listarTiposServicio } from './trabajos.api';

interface Props {
  onGuardar: (valores: TrabajoFormValues) => Promise<void>;
  onCancelar: () => void;
  guardando: boolean;
}

export function TrabajoForm({ onGuardar, onCancelar, guardando }: Props) {
  const { register, handleSubmit } = useForm<TrabajoFormValues>({
    defaultValues: { garantiaDias: 90 },
  });

  const { data: clientes } = useQuery({ queryKey: ['clientes'], queryFn: () => listarClientes() });
  const { data: tiposServicio } = useQuery({
    queryKey: ['tipos-servicio'],
    queryFn: listarTiposServicio,
  });
  const { data: tiposEquipo } = useQuery({ queryKey: ['tipos-equipo'], queryFn: listarTiposEquipo });

  return (
    <form onSubmit={handleSubmit(onGuardar)} className="space-y-4">
      <div>
        <label className="mb-1 block text-sm font-medium text-gray-700">Cliente *</label>
        <select
          {...register('clienteId', { required: true })}
          className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-climarte focus:outline-none focus:ring-1 focus:ring-climarte"
        >
          <option value="">Seleccionar...</option>
          {clientes?.map((c) => (
            <option key={c.id} value={c.id}>
              {c.nombre}
            </option>
          ))}
        </select>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">Tipo de equipo *</label>
          <select
            {...register('tipoEquipoId', { required: true })}
            className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-climarte focus:outline-none focus:ring-1 focus:ring-climarte"
          >
            <option value="">Seleccionar...</option>
            {tiposEquipo?.map((t) => (
              <option key={t.id} value={t.id}>
                {t.nombre}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">Tipo de servicio *</label>
          <select
            {...register('tipoServicioId', { required: true })}
            className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-climarte focus:outline-none focus:ring-1 focus:ring-climarte"
          >
            <option value="">Seleccionar...</option>
            {tiposServicio?.map((t) => (
              <option key={t.id} value={t.id}>
                {t.nombre}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div>
        <label className="mb-1 block text-sm font-medium text-gray-700">Descripción</label>
        <textarea
          {...register('descripcion')}
          rows={2}
          className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-climarte focus:outline-none focus:ring-1 focus:ring-climarte"
        />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">
            Precio presupuestado
          </label>
          <input
            type="number"
            step="0.01"
            {...register('precioPresupuestado', { valueAsNumber: true })}
            className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-climarte focus:outline-none focus:ring-1 focus:ring-climarte"
          />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">
            Garantía (días)
          </label>
          <input
            type="number"
            {...register('garantiaDias', { valueAsNumber: true })}
            className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-climarte focus:outline-none focus:ring-1 focus:ring-climarte"
          />
        </div>
      </div>

      <div>
        <label className="mb-1 block text-sm font-medium text-gray-700">Forma de pago</label>
        <input
          {...register('formaPago')}
          placeholder="Efectivo, transferencia, Mercado Pago..."
          className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-climarte focus:outline-none focus:ring-1 focus:ring-climarte"
        />
      </div>

      <div>
        <label className="mb-1 block text-sm font-medium text-gray-700">Observaciones</label>
        <textarea
          {...register('observaciones')}
          rows={2}
          className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-climarte focus:outline-none focus:ring-1 focus:ring-climarte"
        />
      </div>

      <div className="flex justify-end gap-2 pt-2">
        <button
          type="button"
          onClick={onCancelar}
          className="rounded-md border border-gray-300 px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-100"
        >
          Cancelar
        </button>
        <button
          type="submit"
          disabled={guardando}
          className="rounded-md bg-climarte px-4 py-2 text-sm font-semibold text-white hover:bg-climarte-dark disabled:opacity-60"
        >
          {guardando ? 'Guardando...' : 'Crear trabajo'}
        </button>
      </div>
    </form>
  );
}
