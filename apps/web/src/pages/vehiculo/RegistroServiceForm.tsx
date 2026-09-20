import { useForm } from "react-hook-form";
import { RegistroServiceFormValues } from "./vehiculo.api";

interface Props {
  onGuardar: (valores: RegistroServiceFormValues) => Promise<void>;
  onCancelar: () => void;
  guardando: boolean;
}

export function RegistroServiceForm({
  onGuardar,
  onCancelar,
  guardando,
}: Props) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegistroServiceFormValues>();

  return (
    <form onSubmit={handleSubmit(onGuardar)} className="space-y-4">
      <div>
        <label className="mb-1 block text-sm font-medium text-gray-700">
          Descripción *
        </label>
        <input
          {...register("descripcion", {
            required: "La descripción es obligatoria",
          })}
          className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-climarte focus:outline-none focus:ring-1 focus:ring-climarte"
        />
        {errors.descripcion && (
          <p className="mt-1 text-xs text-red-600">
            {errors.descripcion.message}
          </p>
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
          Importe total *
        </label>
        <input
          type="number"
          step="0.01"
          {...register("importeTotal", {
            required: "El importe total es obligatorio",
            min: 0,
            valueAsNumber: true,
          })}
          className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-climarte focus:outline-none focus:ring-1 focus:ring-climarte"
        />
        {errors.importeTotal && (
          <p className="mt-1 text-xs text-red-600">
            {errors.importeTotal.message}
          </p>
        )}
      </div>

      <div>
        <label className="mb-1 block text-sm font-medium text-gray-700">
          % atribuido al negocio *
        </label>
        <input
          type="number"
          step="1"
          {...register("porcentajeAtribuido", {
            required: "El porcentaje es obligatorio",
            min: 0,
            max: 100,
            valueAsNumber: true,
          })}
          className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-climarte focus:outline-none focus:ring-1 focus:ring-climarte"
        />
        {errors.porcentajeAtribuido && (
          <p className="mt-1 text-xs text-red-600">
            {errors.porcentajeAtribuido.message}
          </p>
        )}
        <p className="mt-1 text-xs text-gray-400">
          El importe atribuido se calcula automáticamente al guardar.
        </p>
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
