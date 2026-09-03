import { useForm } from "react-hook-form";
import { HerramientaFormValues } from "./herramientas.api";

interface Props {
  valoresIniciales?: Partial<HerramientaFormValues>;
  onGuardar: (valores: HerramientaFormValues) => Promise<void>;
  onCancelar: () => void;
  guardando: boolean;
}

export function HerramientaForm({
  valoresIniciales,
  onGuardar,
  onCancelar,
  guardando,
}: Props) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<HerramientaFormValues>({ defaultValues: valoresIniciales });

  return (
    <form onSubmit={handleSubmit(onGuardar)} className="space-y-4">
      <div>
        <label className="mb-1 block text-sm font-medium text-gray-700">
          Nombre *
        </label>
        <input
          {...register("nombre", {
            required: "El nombre es obligatorio",
            minLength: 2,
          })}
          className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-climarte focus:outline-none focus:ring-1 focus:ring-climarte"
        />
        {errors.nombre && (
          <p className="mt-1 text-xs text-red-600">{errors.nombre.message}</p>
        )}
      </div>

      <div>
        <label className="mb-1 block text-sm font-medium text-gray-700">
          Categoría
        </label>
        <input
          {...register("categoria")}
          className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-climarte focus:outline-none focus:ring-1 focus:ring-climarte"
        />
      </div>

      <div>
        <label className="mb-1 block text-sm font-medium text-gray-700">
          Fecha de compra
        </label>
        <input
          type="date"
          {...register("fechaCompra")}
          className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-climarte focus:outline-none focus:ring-1 focus:ring-climarte"
        />
      </div>

      <div>
        <label className="mb-1 block text-sm font-medium text-gray-700">
          Importe
        </label>
        <input
          type="number"
          step="0.01"
          {...register("importe", { min: 0 })}
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
