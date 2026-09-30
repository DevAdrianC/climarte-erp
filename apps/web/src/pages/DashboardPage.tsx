import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { apiClient } from "../api/client";

interface Participacion {
  id: string;
  porcentaje: string;
  socio: { id: string; nombre: string };
}

interface ResumenSocio {
  socioId: string;
  socioNombre: string;
  porcentaje: number;
  gananciaPorManoDeObra: number;
  reembolsos: number;
  retiros: number;
  saldoPendiente: number;
}

interface Resumen {
  periodo: string;
  ingresos: number;
  costosDirectos: number;
  gastos: { fijos: number; variables: number; total: number };
  gastosAsociadosATrabajos: number;
  resultado: number;
  trabajos: {
    finalizados: number;
    pendientes: number;
    presupuestosPendientes: number;
  };
  pendienteDeCobro: number;
  resultadoPorSocio: ResumenSocio[];
  inversionPublicidad: number;
}

function periodoActual() {
  const hoy = new Date();
  return `${hoy.getFullYear()}-${String(hoy.getMonth() + 1).padStart(2, "0")}`;
}

function formatearMonto(valor: number) {
  return `$${valor.toLocaleString("es-AR", { minimumFractionDigits: 2 })}`;
}

export function DashboardPage() {
  const [periodo, setPeriodo] = useState(periodoActual());

  const {
    data: participacion,
    isLoading: cargandoParticipacion,
    isError: errorParticipacion,
  } = useQuery({
    queryKey: ["config-participacion"],
    queryFn: async () => {
      const { data } = await apiClient.get<Participacion[]>(
        "/config-participacion",
      );
      return data;
    },
  });

  const { data: resumen, isLoading: cargandoResumen } = useQuery({
    queryKey: ["dashboard-resumen", periodo],
    queryFn: async () => {
      const { data } = await apiClient.get<Resumen>("/dashboard/resumen", {
        params: { periodo },
      });
      return data;
    },
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold text-gray-800">Dashboard</h2>
        <input
          type="month"
          value={periodo}
          onChange={(e) => setPeriodo(e.target.value)}
          className="rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-climarte focus:outline-none focus:ring-1 focus:ring-climarte"
        />
      </div>

      {cargandoResumen && (
        <p className="text-sm text-gray-400">Calculando...</p>
      )}

      {resumen && (
        <>
          <div className="grid grid-cols-1 gap-4 rounded-xl border border-gray-200 bg-white p-6 sm:grid-cols-4">
            <Indicador
              label="Ingresos"
              valor={formatearMonto(resumen.ingresos)}
            />
            <Indicador
              label="Costos directos"
              valor={formatearMonto(resumen.costosDirectos)}
            />
            <Indicador
              label="Gastos generales"
              valor={formatearMonto(resumen.gastos.total)}
            />
            <Indicador
              label="Resultado"
              valor={formatearMonto(resumen.resultado)}
              destacado={resumen.resultado >= 0 ? "positivo" : "negativo"}
            />
          </div>

          <div className="grid grid-cols-1 gap-4 rounded-xl border border-gray-200 bg-white p-6 sm:grid-cols-4">
            <Indicador
              label="Trabajos finalizados"
              valor={String(resumen.trabajos.finalizados)}
            />
            <Indicador
              label="Trabajos pendientes"
              valor={String(resumen.trabajos.pendientes)}
            />
            <Indicador
              label="Presupuestos pendientes"
              valor={String(resumen.trabajos.presupuestosPendientes)}
            />
            <Indicador
              label="Pendiente de cobro"
              valor={formatearMonto(resumen.pendienteDeCobro)}
            />
          </div>

          <div className="rounded-xl border border-dashed border-gray-300 bg-gray-50 p-4">
            <p className="text-sm text-gray-600">
              Gastos asociados a trabajos del período:{" "}
              <span className="font-semibold">
                {formatearMonto(resumen.gastosAsociadosATrabajos)}
              </span>
            </p>
            <p className="mt-1 text-xs text-gray-400">
              Informativo — no está incluido en el resultado ni en la
              Liquidación mensual.
            </p>
          </div>

          <div className="overflow-hidden rounded-xl border border-gray-200 bg-white">
            <table className="w-full text-left text-sm">
              <thead className="bg-gray-50 text-xs uppercase tracking-wide text-gray-500">
                <tr>
                  <th className="px-4 py-3">Socio</th>
                  <th className="px-4 py-3">Ganancia (mano de obra)</th>
                  <th className="px-4 py-3">Reembolsos</th>
                  <th className="px-4 py-3">Saldo pendiente</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {resumen.resultadoPorSocio.map((s) => (
                  <tr key={s.socioId} className="hover:bg-gray-50">
                    <td className="px-4 py-3 font-medium text-gray-800">
                      {s.socioNombre}
                    </td>
                    <td className="px-4 py-3 text-gray-600">
                      {formatearMonto(s.gananciaPorManoDeObra)}
                    </td>
                    <td className="px-4 py-3 text-gray-600">
                      {formatearMonto(s.reembolsos)}
                    </td>
                    <td className="px-4 py-3 font-semibold text-climarte-dark">
                      {formatearMonto(s.saldoPendiente)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}

      <div className="rounded-xl border border-gray-200 bg-white p-6">
        <h3 className="mb-3 text-sm font-semibold uppercase tracking-wide text-gray-500">
          Participación societaria vigente
        </h3>

        {cargandoParticipacion && (
          <p className="text-sm text-gray-400">Cargando...</p>
        )}
        {errorParticipacion && (
          <p className="text-sm text-red-600">
            No se pudo consultar la API. Verificá que el backend esté corriendo.
          </p>
        )}

        {participacion && (
          <div className="flex gap-8">
            {participacion.map((p) => (
              <div key={p.id}>
                <p className="text-2xl font-bold text-climarte-dark">
                  {p.porcentaje}%
                </p>
                <p className="text-sm text-gray-500">{p.socio.nombre}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function Indicador({
  label,
  valor,
  destacado,
}: {
  label: string;
  valor: string;
  destacado?: "positivo" | "negativo";
}) {
  return (
    <div>
      <p className="text-xs uppercase tracking-wide text-gray-400">{label}</p>
      <p
        className={`text-lg font-semibold ${
          destacado === "positivo"
            ? "text-green-600"
            : destacado === "negativo"
              ? "text-red-600"
              : "text-gray-800"
        }`}
      >
        {valor}
      </p>
    </div>
  );
}
