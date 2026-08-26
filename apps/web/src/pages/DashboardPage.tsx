import { useQuery } from '@tanstack/react-query';
import { apiClient } from '../api/client';

interface Participacion {
  id: string;
  porcentaje: string;
  socio: { id: string; nombre: string };
}

export function DashboardPage() {
  const { data, isLoading, isError } = useQuery({
    queryKey: ['config-participacion'],
    queryFn: async () => {
      const { data } = await apiClient.get<Participacion[]>('/config-participacion');
      return data;
    },
  });

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-gray-800">Dashboard</h2>
        <p className="text-sm text-gray-500">
          Los indicadores completos (ingresos, gastos, resultado, cobros pendientes) se
          construyen en el Sprint 6. Por ahora, esta pantalla confirma que el frontend y el
          backend ya se comunican correctamente.
        </p>
      </div>

      <div className="rounded-xl border border-gray-200 bg-white p-6">
        <h3 className="mb-3 text-sm font-semibold uppercase tracking-wide text-gray-500">
          Participación societaria vigente
        </h3>

        {isLoading && <p className="text-sm text-gray-400">Cargando...</p>}
        {isError && (
          <p className="text-sm text-red-600">
            No se pudo consultar la API. Verificá que el backend esté corriendo.
          </p>
        )}

        {data && (
          <div className="flex gap-8">
            {data.map((p) => (
              <div key={p.id}>
                <p className="text-2xl font-bold text-climarte-dark">{p.porcentaje}%</p>
                <p className="text-sm text-gray-500">{p.socio.nombre}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
