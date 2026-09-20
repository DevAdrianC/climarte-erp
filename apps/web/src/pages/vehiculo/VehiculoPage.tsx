import { useState } from "react";
import { useForm } from "react-hook-form";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Modal } from "../../components/Modal";
import { RegistroCombustibleForm } from "./RegistroCombustibleForm";
import { RegistroServiceForm } from "./RegistroServiceForm";
import {
  RegistroCombustibleFormValues,
  RegistroServiceFormValues,
  VehiculoFormValues,
  agregarCombustible,
  agregarService,
  crearVehiculo,
  listarCombustible,
  listarService,
  listarVehiculos,
} from "./vehiculo.api";

type Tab = "combustible" | "service";

export function VehiculoPage() {
  const [tab, setTab] = useState<Tab>("combustible");
  const [modalAbierto, setModalAbierto] = useState(false);
  const queryClient = useQueryClient();

  const { data: vehiculos, isLoading: cargandoVehiculos } = useQuery({
    queryKey: ["vehiculos"],
    queryFn: listarVehiculos,
  });

  const { mutateAsync: crear, isPending: guardandoVehiculo } = useMutation({
    mutationFn: crearVehiculo,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["vehiculos"] }),
  });

  const vehiculo = vehiculos?.[0];

  const { data: combustible, isLoading: cargandoCombustible } = useQuery({
    queryKey: ["vehiculo-combustible", vehiculo?.id],
    queryFn: () => listarCombustible(vehiculo!.id),
    enabled: !!vehiculo,
  });

  const { data: service, isLoading: cargandoService } = useQuery({
    queryKey: ["vehiculo-service", vehiculo?.id],
    queryFn: () => listarService(vehiculo!.id),
    enabled: !!vehiculo,
  });

  const { mutateAsync: crearCombustible, isPending: guardandoCombustible } =
    useMutation({
      mutationFn: (valores: RegistroCombustibleFormValues) =>
        agregarCombustible(vehiculo!.id, valores),
      onSuccess: () => {
        queryClient.invalidateQueries({
          queryKey: ["vehiculo-combustible", vehiculo?.id],
        });
        setModalAbierto(false);
      },
    });

  const { mutateAsync: crearService, isPending: guardandoService } =
    useMutation({
      mutationFn: (valores: RegistroServiceFormValues) =>
        agregarService(vehiculo!.id, valores),
      onSuccess: () => {
        queryClient.invalidateQueries({
          queryKey: ["vehiculo-service", vehiculo?.id],
        });
        setModalAbierto(false);
      },
    });

  async function handleGuardarCombustible(
    valores: RegistroCombustibleFormValues,
  ) {
    await crearCombustible({
      ...valores,
      fecha: valores.fecha || undefined,
      trabajoId: valores.trabajoId || undefined,
    });
  }

  async function handleGuardarService(valores: RegistroServiceFormValues) {
    await crearService({ ...valores, fecha: valores.fecha || undefined });
  }

  // ---------- Sin vehículo cargado todavía: formulario de alta ----------

  const {
    register: registerVehiculo,
    handleSubmit: handleSubmitVehiculo,
    formState: { errors: erroresVehiculo },
  } = useForm<VehiculoFormValues>();

  if (cargandoVehiculos) {
    return <p className="text-gray-400">Cargando...</p>;
  }

  if (!vehiculo) {
    return (
      <div className="max-w-md space-y-4">
        <h2 className="text-xl font-semibold text-gray-800">Vehículo</h2>
        <p className="text-sm text-gray-600">
          Todavía no hay ningún vehículo cargado. Cargá los datos del vehículo
          del negocio para empezar a registrar combustible y service.
        </p>
        <form
          onSubmit={handleSubmitVehiculo((v) => crear(v))}
          className="space-y-4"
        >
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">
              Marca *
            </label>
            <input
              {...registerVehiculo("marca", {
                required: "La marca es obligatoria",
              })}
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-climarte focus:outline-none focus:ring-1 focus:ring-climarte"
            />
            {erroresVehiculo.marca && (
              <p className="mt-1 text-xs text-red-600">
                {erroresVehiculo.marca.message}
              </p>
            )}
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">
              Modelo *
            </label>
            <input
              {...registerVehiculo("modelo", {
                required: "El modelo es obligatorio",
              })}
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-climarte focus:outline-none focus:ring-1 focus:ring-climarte"
            />
            {erroresVehiculo.modelo && (
              <p className="mt-1 text-xs text-red-600">
                {erroresVehiculo.modelo.message}
              </p>
            )}
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">
              Patente *
            </label>
            <input
              {...registerVehiculo("patente", {
                required: "La patente es obligatoria",
              })}
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-climarte focus:outline-none focus:ring-1 focus:ring-climarte"
            />
            {erroresVehiculo.patente && (
              <p className="mt-1 text-xs text-red-600">
                {erroresVehiculo.patente.message}
              </p>
            )}
          </div>
          <button
            type="submit"
            disabled={guardandoVehiculo}
            className="rounded-md bg-climarte px-4 py-2 text-sm font-semibold text-white hover:bg-climarte-dark disabled:opacity-60"
          >
            {guardandoVehiculo ? "Guardando..." : "Guardar vehículo"}
          </button>
        </form>
      </div>
    );
  }

  // ---------- Vehículo ya cargado: combustible y service ----------

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold text-gray-800">
          Vehículo — {vehiculo.marca} {vehiculo.modelo} ({vehiculo.patente})
        </h2>
        <button
          onClick={() => setModalAbierto(true)}
          className="rounded-md bg-climarte px-4 py-2 text-sm font-semibold text-white hover:bg-climarte-dark"
        >
          + Nuevo registro
        </button>
      </div>

      <div className="flex gap-2 border-b border-gray-200">
        <button
          onClick={() => setTab("combustible")}
          className={`px-3 py-2 text-sm font-medium ${
            tab === "combustible"
              ? "border-b-2 border-climarte text-climarte-dark"
              : "text-gray-500 hover:text-gray-700"
          }`}
        >
          Combustible
        </button>
        <button
          onClick={() => setTab("service")}
          className={`px-3 py-2 text-sm font-medium ${
            tab === "service"
              ? "border-b-2 border-climarte text-climarte-dark"
              : "text-gray-500 hover:text-gray-700"
          }`}
        >
          Service
        </button>
      </div>

      {tab === "combustible" && (
        <div className="overflow-hidden rounded-xl border border-gray-200 bg-white">
          <table className="w-full text-left text-sm">
            <thead className="bg-gray-50 text-xs uppercase tracking-wide text-gray-500">
              <tr>
                <th className="px-4 py-3">Fecha</th>
                <th className="px-4 py-3">Litros</th>
                <th className="px-4 py-3">Importe</th>
                <th className="px-4 py-3">Asociado a trabajo</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {cargandoCombustible && (
                <tr>
                  <td
                    colSpan={4}
                    className="px-4 py-6 text-center text-gray-400"
                  >
                    Cargando...
                  </td>
                </tr>
              )}
              {!cargandoCombustible && combustible?.length === 0 && (
                <tr>
                  <td
                    colSpan={4}
                    className="px-4 py-6 text-center text-gray-400"
                  >
                    No hay cargas de combustible registradas todavía.
                  </td>
                </tr>
              )}
              {combustible?.map((c) => (
                <tr key={c.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 text-gray-600">
                    {new Date(c.fecha).toLocaleDateString("es-AR")}
                  </td>
                  <td className="px-4 py-3 text-gray-600">{c.litros ?? "—"}</td>
                  <td className="px-4 py-3 text-gray-600">
                    ${Number(c.importe).toLocaleString("es-AR")}
                  </td>
                  <td className="px-4 py-3 text-gray-600">
                    {c.trabajoId ? "Sí" : "—"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {tab === "service" && (
        <div className="overflow-hidden rounded-xl border border-gray-200 bg-white">
          <table className="w-full text-left text-sm">
            <thead className="bg-gray-50 text-xs uppercase tracking-wide text-gray-500">
              <tr>
                <th className="px-4 py-3">Fecha</th>
                <th className="px-4 py-3">Descripción</th>
                <th className="px-4 py-3">Importe total</th>
                <th className="px-4 py-3">% atribuido</th>
                <th className="px-4 py-3">Importe atribuido</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {cargandoService && (
                <tr>
                  <td
                    colSpan={5}
                    className="px-4 py-6 text-center text-gray-400"
                  >
                    Cargando...
                  </td>
                </tr>
              )}
              {!cargandoService && service?.length === 0 && (
                <tr>
                  <td
                    colSpan={5}
                    className="px-4 py-6 text-center text-gray-400"
                  >
                    No hay services registrados todavía.
                  </td>
                </tr>
              )}
              {service?.map((s) => (
                <tr key={s.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 text-gray-600">
                    {new Date(s.fecha).toLocaleDateString("es-AR")}
                  </td>
                  <td className="px-4 py-3 font-medium text-gray-800">
                    {s.descripcion}
                  </td>
                  <td className="px-4 py-3 text-gray-600">
                    ${Number(s.importeTotal).toLocaleString("es-AR")}
                  </td>
                  <td className="px-4 py-3 text-gray-600">
                    {Number(s.porcentajeAtribuido)}%
                  </td>
                  <td className="px-4 py-3 text-gray-600">
                    ${Number(s.importeAtribuido).toLocaleString("es-AR")}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {modalAbierto && tab === "combustible" && (
        <Modal
          titulo="Nueva carga de combustible"
          onCerrar={() => setModalAbierto(false)}
        >
          <RegistroCombustibleForm
            onGuardar={handleGuardarCombustible}
            onCancelar={() => setModalAbierto(false)}
            guardando={guardandoCombustible}
          />
        </Modal>
      )}

      {modalAbierto && tab === "service" && (
        <Modal titulo="Nuevo service" onCerrar={() => setModalAbierto(false)}>
          <RegistroServiceForm
            onGuardar={handleGuardarService}
            onCancelar={() => setModalAbierto(false)}
            guardando={guardandoService}
          />
        </Modal>
      )}
    </div>
  );
}
