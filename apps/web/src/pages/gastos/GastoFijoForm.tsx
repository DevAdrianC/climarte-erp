import { useForm } from "react-hook-form";
import { useQuery } from "@tanstack/react-query";
import { GastoFijoFormValues, listarCategorias } from "./gastos.api";

interface Props {
  onGuardar: (valores: GastoFijoFormValues) => Promise<void>;
  onCancelar: () => void;
  guardando: boolean;
}

export function GastoFijoForm({ onGuardar, onCancelar, guardando }: Props) {
  const { data: categorias } = useQuery({
    queryKey: ["categorias-gasto"],
    queryFn: listarCategorias,
  });
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<GastoFijoFormValues>();

  return (
    <form onSubmit={handleSubmit(onGuardar)} className="space-y-4">
      <div>
        <label className="mb-1 block text-sm font-medium text-gray-700">
          Categoría *
        </label>
        <select
          {...register("categoriaId", {
            required: "La categoría es obligatoria",
          })}
          className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-climarte focus:outline-none focus:ring-1 focus:ring-climarte"
        >
          <option value="">Seleccionar...</option>
          {categorias?.map((c) => (
            <option key={c.id} value={c.id}>
              {c.nombre}
            </option>
          ))}
        </select>
        {errors.categoriaId && (
          <p className="mt-1 text-xs text-red-600">
            {errors.categoriaId.message}
          </p>
        )}
      </div>

      <div>
        <label className="mb-1 block text-sm font-medium text-gray-700">
          Importe mensual *
        </label>
        <input
          type="number"
          step="0.01"
          {...register("importeMensual", {
            required: "El importe es obligatorio",
            min: 0,
            valueAsNumber: true,
          })}
          className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-climarte focus:outline-none focus:ring-1 focus:ring-climarte"
        />
        {errors.importeMensual && (
          <p className="mt-1 text-xs text-red-600">
            {errors.importeMensual.message}
          </p>
        )}
      </div>

      <div>
        <label className="mb-1 block text-sm font-medium text-gray-700">
          Descripción
        </label>
        <input
          {...register("descripcion")}
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
