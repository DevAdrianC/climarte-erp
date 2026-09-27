import { useForm } from "react-hook-form";
import { useQuery } from "@tanstack/react-query";
import { listarUsuarios } from "../trabajos/trabajos.api";
import { RetiroFormValues } from "./liquidacion.api";

interface Props {
  onGuardar: (valores: RetiroFormValues) => Promise<void>;
  onCancelar: () => void;
  guardando: boolean;
}

export function RetiroForm({ onGuardar, onCancelar, guardando }: Props) {
  const { data: usuarios } = useQuery({
    queryKey: ["usuarios"],
    queryFn: listarUsuarios,
  });
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RetiroFormValues>();

  return (
    <form onSubmit={handleSubmit(onGuardar)} className="space-y-4">
      <div>
        <label className="mb-1 block text-sm font-medium text-gray-700">
          Socio *
        </label>
        <select
          {...register("socioId", { required: "El socio es obligatorio" })}
          className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-climarte focus:outline-none focus:ring-1 focus:ring-climarte"
        >
          <option value="">Seleccionar...</option>
          {usuarios?.map((u) => (
            <option key={u.id} value={u.id}>
              {u.nombre}
            </option>
          ))}
        </select>
        {errors.socioId && (
          <p className="mt-1 text-xs text-red-600">{errors.socioId.message}</p>
        )}
      </div>

      <div>
        <label className="mb-1 block text-sm font-medium text-gray-700">
          Importe *
        </label>
        <input
          type="number"
          step="0.01"
          {...register("importe", {
            required: "El importe es obligatorio",
            min: 0,
            valueAsNumber: true,
          })}
          className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-climarte focus:outline-none focus:ring-1 focus:ring-climarte"
        />
        {errors.importe && (
          <p className="mt-1 text-xs text-red-600">{errors.importe.message}</p>
        )}
      </div>

      <div>
        <label className="mb-1 block text-sm font-medium text-gray-700">
          Fecha
        </label>
        <input
          type="date"
          {...register("fecha")}
          className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-climarte focus:outline-none focus:ring-1 focus:ring-climarte"
        />
      </div>

      <div>
        <label className="mb-1 block text-sm font-medium text-gray-700">
          Concepto
        </label>
        <input
          {...register("concepto")}
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
          {guardando ? "Guardando..." : "Guardar"}
        </button>
      </div>
    </form>
  );
}
