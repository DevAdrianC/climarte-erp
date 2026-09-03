import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Modal } from "../../components/Modal";
import { HerramientaForm } from "./HerramientaForm";
import {
  HerramientaFormValues,
  crearHerramienta,
  darDeBajaHerramienta,
  listarHerramientas,
} from "./herramientas.api";

export function HerramientasPage() {
  const [modalAbierto, setModalAbierto] = useState(false);
  const queryClient = useQueryClient();

  const { data: herramientas, isLoading } = useQuery({
    queryKey: ["herramientas"],
    queryFn: () => listarHerramientas(),
  });

  const { mutateAsync: crear, isPending: guardando } = useMutation({
    mutationFn: crearHerramienta,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["herramientas"] });
      setModalAbierto(false);
    },
  });

  const { mutate: darDeBaja } = useMutation({
    mutationFn: darDeBajaHerramienta,
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: ["herramientas"] }),
  });

  async function handleGuardar(valores: HerramientaFormValues) {
    await crear(valores);
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold text-gray-800">Herramientas</h2>
        <button
          onClick={() => setModalAbierto(true)}
          className="rounded-md bg-climarte px-4 py-2 text-sm font-semibold text-white hover:bg-climarte-dark"
        >
          + Nueva herramienta
        </button>
      </div>

      <div className="overflow-hidden rounded-xl border border-gray-200 bg-white">
        <table className="w-full text-left text-sm">
          <thead className="bg-gray-50 text-xs uppercase tracking-wide text-gray-500">
            <tr>
              <th className="px-4 py-3">Nombre</th>
              <th className="px-4 py-3">Categoría</th>
              <th className="px-4 py-3">Fecha de compra</th>
              <th className="px-4 py-3">Importe</th>
              <th className="px-4 py-3"></th>
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
            {!isLoading && herramientas?.length === 0 && (
              <tr>
                <td colSpan={5} className="px-4 py-6 text-center text-gray-400">
                  No hay herramientas cargadas todavía.
                </td>
              </tr>
            )}
            {herramientas?.map((h) => (
              <tr key={h.id} className="hover:bg-gray-50">
                <td className="px-4 py-3 font-medium text-gray-800">
                  {h.nombre}
                </td>
                <td className="px-4 py-3 text-gray-600">
                  {h.categoria ?? "—"}
                </td>
                <td className="px-4 py-3 text-gray-600">
                  {h.fechaCompra
                    ? new Date(h.fechaCompra).toLocaleDateString("es-AR")
                    : "—"}
                </td>
                <td className="px-4 py-3 text-gray-600">
                  {h.importe
                    ? `$${Number(h.importe).toLocaleString("es-AR")}`
                    : "—"}
                </td>
                <td className="px-4 py-3 text-right">
                  <button
                    onClick={() => darDeBaja(h.id)}
                    className="text-xs font-medium text-red-600 hover:underline"
                  >
                    Dar de baja
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {modalAbierto && (
        <Modal
          titulo="Nueva herramienta"
          onCerrar={() => setModalAbierto(false)}
        >
          <HerramientaForm
            onGuardar={handleGuardar}
            onCancelar={() => setModalAbierto(false)}
            guardando={guardando}
          />
        </Modal>
      )}
    </div>
  );
}
