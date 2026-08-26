import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  RolEnTrabajo,
  listarColaboradoresExternos,
  listarUsuarios,
} from './trabajos.api';

interface Props {
  onAgregar: (valores: {
    rolEnTrabajo: RolEnTrabajo;
    usuarioId?: string;
    colaboradorExternoId?: string;
  }) => Promise<void>;
  guardando: boolean;
}

export function AgregarParticipanteForm({ onAgregar, guardando }: Props) {
  const [rol, setRol] = useState<RolEnTrabajo>('RESPONSABLE');
  const [personaId, setPersonaId] = useState('');

  const { data: usuarios } = useQuery({ queryKey: ['usuarios'], queryFn: listarUsuarios });
  const { data: colaboradores } = useQuery({
    queryKey: ['colaboradores-externos'],
    queryFn: listarColaboradoresExternos,
  });

  const esExterno = rol === 'COLABORADOR_EXTERNO';

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!personaId) return;
    await onAgregar(
      esExterno
        ? { rolEnTrabajo: rol, colaboradorExternoId: personaId }
        : { rolEnTrabajo: rol, usuarioId: personaId },
    );
    setPersonaId('');
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-wrap items-end gap-2">
      <div>
        <label className="mb-1 block text-xs text-gray-500">Rol</label>
        <select
          value={rol}
          onChange={(e) => {
            setRol(e.target.value as RolEnTrabajo);
            setPersonaId('');
          }}
          className="rounded-md border border-gray-300 px-2 py-1.5 text-sm"
        >
          <option value="RESPONSABLE">Responsable</option>
          <option value="PARTICIPANTE">Participante</option>
          <option value="COLABORADOR_EXTERNO">Colaborador externo</option>
        </select>
      </div>

      <div>
        <label className="mb-1 block text-xs text-gray-500">
          {esExterno ? 'Colaborador' : 'Socio'}
        </label>
        <select
          value={personaId}
          onChange={(e) => setPersonaId(e.target.value)}
          className="min-w-[10rem] rounded-md border border-gray-300 px-2 py-1.5 text-sm"
        >
          <option value="">Seleccionar...</option>
          {!esExterno &&
            usuarios?.map((u) => (
              <option key={u.id} value={u.id}>
                {u.nombre}
              </option>
            ))}
          {esExterno &&
            colaboradores?.map((c) => (
              <option key={c.id} value={c.id}>
                {c.nombre}
              </option>
            ))}
        </select>
      </div>

      <button
        type="submit"
        disabled={guardando || !personaId}
        className="rounded-md border border-climarte px-3 py-1.5 text-sm font-medium text-climarte-dark hover:bg-climarte/10 disabled:opacity-50"
      >
        + Agregar
      </button>
    </form>
  );
}
