import { apiClient } from "../../api/client";

export interface Herramienta {
  id: string;
  nombre: string;
  categoria?: string | null;
  fechaCompra?: string | null;
  importe?: string | null;
  estado: "ACTIVA" | "DADA_DE_BAJA";
  creadoEn: string;
}

export type HerramientaFormValues = Pick<
  Herramienta,
  "nombre" | "categoria" | "fechaCompra" | "importe"
>;

export async function listarHerramientas(
  incluirBaja = false,
): Promise<Herramienta[]> {
  const { data } = await apiClient.get<Herramienta[]>("/herramientas", {
    params: incluirBaja ? { incluirBaja: "true" } : undefined,
  });
  return data;
}

export async function crearHerramienta(
  valores: HerramientaFormValues,
): Promise<Herramienta> {
  const { data } = await apiClient.post<Herramienta>("/herramientas", valores);
  return data;
}

export async function actualizarHerramienta(
  id: string,
  valores: Partial<HerramientaFormValues>,
): Promise<Herramienta> {
  const { data } = await apiClient.patch<Herramienta>(
    `/herramientas/${id}`,
    valores,
  );
  return data;
}

export async function darDeBajaHerramienta(id: string): Promise<Herramienta> {
  const { data } = await apiClient.patch<Herramienta>(
    `/herramientas/${id}/dar-de-baja`,
    {},
  );
  return data;
}
