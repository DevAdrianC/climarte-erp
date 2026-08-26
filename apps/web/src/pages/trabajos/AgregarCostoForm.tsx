import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { TipoCosto, listarUsuarios } from './trabajos.api';
import { TEXTO_TIPO_COSTO } from './estados.helpers';

interface Props {
  onAgregar: (valores: {
    tipo: TipoCosto;
    importe: number;
    descripcion?: string;
    pagadoPorId?: string;
  }) => Promise<void>;
  guardando: boolean;
}

const TIPOS: TipoCosto[] = ['MATERIALES', 'TRANSPORTE', 'MANO_OBRA_EXTERNA', 'OTRO'];

export function AgregarCostoForm({ onAgregar, guardando }: Props) {
  const [tipo, setTipo] = useState<TipoCosto>('MATERIALES');
  const [importe, setImporte] = useState('');
  const [descripcion, setDescripcion] = useState('');
  const [pagadoPorId, setPagadoPorId] = useState('');

  const { data: usuarios } = useQuery({ queryKey: ['usuarios'], queryFn: listarUsuarios });

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const monto = Number(importe);
    if (!monto || monto <= 0) return;
    await onAgregar({
      tipo,
      importe: monto,
      descripcion: descripcion || undefined,
      pagadoPorId: pagadoPorId || undefined,
    });
    setImporte('');
    setDescripcion('');
    setPagadoPorId('');
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-wrap items-end gap-2">
      <div>
        <label className="mb-1 block text-xs text-gray-500">Tipo</label>
        <select
          value={tipo}
          onChange={(e) => setTipo(e.target.value as TipoCosto)}
          className="rounded-md border border-gray-300 px-2 py-1.5 text-sm"
        >
          {TIPOS.map((t) => (
            <option key={t} value={t}>
              {TEXTO_TIPO_COSTO[t]}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="mb-1 block text-xs text-gray-500">Importe</label>
        <input
          type="number"
          step="0.01"
          value={importe}
          onChange={(e) => setImporte(e.target.value)}
          className="w-28 rounded-md border border-gray-300 px-2 py-1.5 text-sm"
        />
      </div>

      <div>
        <label className="mb-1 block text-xs text-gray-500">Descripción</label>
        <input
          value={descripcion}
          onChange={(e) => setDescripcion(e.target.value)}
          className="w-40 rounded-md border border-gray-300 px-2 py-1.5 text-sm"
        />
      </div>

      <div>
        <label className="mb-1 block text-xs text-gray-500">Pagado por</label>
        <select
          value={pagadoPorId}
          onChange={(e) => setPagadoPorId(e.target.value)}
          className="rounded-md border border-gray-300 px-2 py-1.5 text-sm"
        >
          <option value="">— (no adelantado)</option>
          {usuarios?.map((u) => (
            <option key={u.id} value={u.id}>
              {u.nombre}
            </option>
          ))}
        </select>
      </div>

      <button
        type="submit"
        disabled={guardando}
        className="rounded-md border border-climarte px-3 py-1.5 text-sm font-medium text-climarte-dark hover:bg-climarte/10 disabled:opacity-50"
      >
        + Agregar
      </button>
    </form>
  );
}
