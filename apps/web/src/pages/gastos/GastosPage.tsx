import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Modal } from "../../components/Modal";
import { GastoFijoForm } from "./GastoFijoForm";
import { GastoVariableForm } from "./GastoVariableForm";
import {
  GastoFijoFormValues,
  GastoVariableFormValues,
  crearGastoFijo,
  crearGastoVariable,
  listarGastosFijos,
  listarGastosVariables,
} from "./gastos.api";

type Tab = "fijos" | "variables";

export function GastosPage() {
  const [tab, setTab] = useState<Tab>("fijos");
  const [modalAbierto, setModalAbierto] = useState(false);
  const queryClient = useQueryClient();

  const { data: fijos, isLoading: cargandoFijos } = useQuery({
    queryKey: ["gastos-fijos"],
    queryFn: listarGastosFijos,
  });

  const { data: variables, isLoading: cargandoVariables } = useQuery({
    queryKey: ["gastos-variables"],
    queryFn: listarGastosVariables,
  });

  const { mutateAsync: crearFijo, isPending: guardandoFijo } = useMutation({
    mutationFn: crearGastoFijo,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["gastos-fijos"] });
      setModalAbierto(false);
    },
  });

  const { mutateAsync: crearVariable, isPending: guardandoVariable } =
    useMutation({
      mutationFn: crearGastoVariable,
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ["gastos-variables"] });
        setModalAbierto(false);
      },
    });

  async function handleGuardarFijo(valores: GastoFijoFormValues) {
    await crearFijo({
      ...valores,
      descripcion: valores.descripcion || undefined,
    });
  }

  async function handleGuardarVariable(valores: GastoVariableFormValues) {
    await crearVariable({
      ...valores,
      proveedorId: valores.proveedorId || undefined,
      trabajoId: valores.trabajoId || undefined,
      fecha: valores.fecha || undefined,
      descripcion: valores.descripcion || undefined,
    });
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold text-gray-800">Gastos</h2>
        <button
          onClick={() => setModalAbierto(true)}
          className="rounded-md bg-climarte px-4 py-2 text-sm font-semibold text-white hover:bg-climarte-dark"
        >
          + Nuevo gasto
        </button>
      </div>

      <div className="flex gap-2 border-b border-gray-200">
        <button
          onClick={() => setTab("fijos")}
          className={`px-3 py-2 text-sm font-medium ${
            tab === "fijos"
              ? "border-b-2 border-climarte text-climarte-dark"
              : "text-gray-500 hover:text-gray-700"
          }`}
        >
          Fijos
        </button>
        <button
          onClick={() => setTab("variables")}
          className={`px-3 py-2 text-sm font-medium ${
            tab === "variables"
              ? "border-b-2 border-climarte text-climarte-dark"
              : "text-gray-500 hover:text-gray-700"
          }`}
        >
          Variables
        </button>
      </div>

      {tab === "fijos" && (
        <div className="overflow-hidden rounded-xl border border-gray-200 bg-white">
          <table className="w-full text-left text-sm">
            <thead className="bg-gray-50 text-xs uppercase tracking-wide text-gray-500">
              <tr>
                <th className="px-4 py-3">Categoría</th>
                <th className="px-4 py-3">Importe mensual</th>
                <th className="px-4 py-3">Descripción</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {cargandoFijos && (
                <tr>
                  <td
                    colSpan={3}
                    className="px-4 py-6 text-center text-gray-400"
                  >
                    Cargando...
                  </td>
                </tr>
              )}
              {!cargandoFijos && fijos?.length === 0 && (
                <tr>
                  <td
                    colSpan={3}
                    className="px-4 py-6 text-center text-gray-400"
                  >
                    No hay gastos fijos cargados todavía.
                  </td>
                </tr>
              )}
              {fijos?.map((g) => (
                <tr key={g.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 font-medium text-gray-800">
                    {g.categoria.nombre}
                  </td>
                  <td className="px-4 py-3 text-gray-600">
                    ${Number(g.importeMensual).toLocaleString("es-AR")}
                  </td>
                  <td className="px-4 py-3 text-gray-600">
                    {g.descripcion ?? "—"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {tab === "variables" && (
        <div className="overflow-hidden rounded-xl border border-gray-200 bg-white">
          <table className="w-full text-left text-sm">
            <thead className="bg-gray-50 text-xs uppercase tracking-wide text-gray-500">
              <tr>
                <th className="px-4 py-3">Fecha</th>
                <th className="px-4 py-3">Categoría</th>
                <th className="px-4 py-3">Importe</th>
                <th className="px-4 py-3">Asociado a trabajo</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {cargandoVariables && (
                <tr>
                  <td
                    colSpan={4}
                    className="px-4 py-6 text-center text-gray-400"
                  >
                    Cargando...
                  </td>
                </tr>
              )}
              {!cargandoVariables && variables?.length === 0 && (
                <tr>
                  <td
                    colSpan={4}
                    className="px-4 py-6 text-center text-gray-400"
                  >
                    No hay gastos variables cargados todavía.
                  </td>
                </tr>
              )}
              {variables?.map((g) => (
                <tr key={g.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 text-gray-600">
                    {new Date(g.fecha).toLocaleDateString("es-AR")}
                  </td>
                  <td className="px-4 py-3 font-medium text-gray-800">
                    {g.categoria.nombre}
                  </td>
                  <td className="px-4 py-3 text-gray-600">
                    ${Number(g.importe).toLocaleString("es-AR")}
                  </td>
                  <td className="px-4 py-3 text-gray-600">
                    {g.trabajoId ? "Sí" : "—"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {modalAbierto && tab === "fijos" && (
        <Modal
          titulo="Nuevo gasto fijo"
          onCerrar={() => setModalAbierto(false)}
        >
          <GastoFijoForm
            onGuardar={handleGuardarFijo}
            onCancelar={() => setModalAbierto(false)}
            guardando={guardandoFijo}
          />
        </Modal>
      )}

      {modalAbierto && tab === "variables" && (
        <Modal
          titulo="Nuevo gasto variable"
          onCerrar={() => setModalAbierto(false)}
        >
          <GastoVariableForm
            onGuardar={handleGuardarVariable}
            onCancelar={() => setModalAbierto(false)}
            guardando={guardandoVariable}
          />
        </Modal>
      )}
    </div>
  );
}
