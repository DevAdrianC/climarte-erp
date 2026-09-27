import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Modal } from "../../components/Modal";
import { RetiroForm } from "./RetiroForm";
import {
  RetiroFormValues,
  calcularLiquidacion,
  crearRetiro,
} from "./liquidacion.api";

function periodoActual() {
  const hoy = new Date();
  return `${hoy.getFullYear()}-${String(hoy.getMonth() + 1).padStart(2, "0")}`;
}

function formatearMonto(valor: number) {
  return `$${valor.toLocaleString("es-AR", { minimumFractionDigits: 2 })}`;
}

export function LiquidacionPage() {
  const [periodo, setPeriodo] = useState(periodoActual());
  const [modalAbierto, setModalAbierto] = useState(false);
  const queryClient = useQueryClient();

  const { data: liquidacion, isLoading } = useQuery({
    queryKey: ["liquidacion", periodo],
    queryFn: () => calcularLiquidacion(periodo),
  });

  const { mutateAsync: crear, isPending: guardando } = useMutation({
    mutationFn: crearRetiro,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["liquidacion", periodo] });
      setModalAbierto(false);
    },
  });

  async function handleGuardar(valores: RetiroFormValues) {
    await crear({
      ...valores,
      fecha: valores.fecha || undefined,
      concepto: valores.concepto || undefined,
    });
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold text-gray-800">
          Liquidación mensual
        </h2>
        <button
          onClick={() => setModalAbierto(true)}
          className="rounded-md bg-climarte px-4 py-2 text-sm font-semibold text-white hover:bg-climarte-dark"
        >
          + Nuevo retiro
        </button>
      </div>

      <div>
        <label className="mb-1 block text-sm font-medium text-gray-700">
          Período
        </label>
        <input
          type="month"
          value={periodo}
          onChange={(e) => setPeriodo(e.target.value)}
          className="rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-climarte focus:outline-none focus:ring-1 focus:ring-climarte"
        />
      </div>

      {isLoading && <p className="text-sm text-gray-400">Calculando...</p>}

      {liquidacion && (
        <>
          <div className="grid grid-cols-1 gap-4 rounded-xl border border-gray-200 bg-white p-6 sm:grid-cols-3">
            <div>
              <p className="text-xs uppercase tracking-wide text-gray-400">
                Ingresos del período
              </p>
              <p className="text-lg font-semibold text-gray-800">
                {formatearMonto(liquidacion.totalIngresos)}
              </p>
            </div>
            <div>
              <p className="text-xs uppercase tracking-wide text-gray-400">
                Costos directos
              </p>
              <p className="text-lg font-semibold text-gray-800">
                {formatearMonto(liquidacion.totalCostosDirectos)}
              </p>
            </div>
            <div>
              <p className="text-xs uppercase tracking-wide text-gray-400">
                Ganancia por mano de obra
              </p>
              <p className="text-lg font-semibold text-gray-800">
                {formatearMonto(liquidacion.gananciaTotal)}
              </p>
            </div>
          </div>

          <div className="overflow-hidden rounded-xl border border-gray-200 bg-white">
            <table className="w-full text-left text-sm">
              <thead className="bg-gray-50 text-xs uppercase tracking-wide text-gray-500">
                <tr>
                  <th className="px-4 py-3">Socio</th>
                  <th className="px-4 py-3">% participación</th>
                  <th className="px-4 py-3">Ganancia (mano de obra)</th>
                  <th className="px-4 py-3">Reembolsos</th>
                  <th className="px-4 py-3">Retiros</th>
                  <th className="px-4 py-3">Saldo pendiente</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {liquidacion.porSocio.map((s) => (
                  <tr key={s.socioId} className="hover:bg-gray-50">
                    <td className="px-4 py-3 font-medium text-gray-800">
                      {s.socioNombre}
                    </td>
                    <td className="px-4 py-3 text-gray-600">{s.porcentaje}%</td>
                    <td className="px-4 py-3 text-gray-600">
                      {formatearMonto(s.gananciaPorManoDeObra)}
                    </td>
                    <td className="px-4 py-3 text-gray-600">
                      {formatearMonto(s.reembolsos)}
                    </td>
                    <td className="px-4 py-3 text-gray-600">
                      {formatearMonto(s.retiros)}
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

      {modalAbierto && (
        <Modal titulo="Nuevo retiro" onCerrar={() => setModalAbierto(false)}>
          <RetiroForm
            onGuardar={handleGuardar}
            onCancelar={() => setModalAbierto(false)}
            guardando={guardando}
          />
        </Modal>
      )}
    </div>
  );
}
