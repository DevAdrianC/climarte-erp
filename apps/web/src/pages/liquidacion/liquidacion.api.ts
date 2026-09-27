import { apiClient } from "../../api/client";

export interface LiquidacionPorSocio {
  socioId: string;
  socioNombre: string;
  porcentaje: number;
  gananciaPorManoDeObra: number;
  reembolsos: number;
  retiros: number;
  saldoPendiente: number;
}

export interface Liquidacion {
  periodo: string;
  totalIngresos: number;
  totalCostosDirectos: number;
  gananciaTotal: number;
  porSocio: LiquidacionPorSocio[];
}

export async function calcularLiquidacion(
  periodo: string,
): Promise<Liquidacion> {
  const { data } = await apiClient.get<Liquidacion>("/liquidacion", {
    params: { periodo },
  });
  return data;
}

export type RetiroFormValues = {
  socioId: string;
  importe: number;
  fecha?: string;
  concepto?: string;
};

export async function crearRetiro(valores: RetiroFormValues) {
  const { data } = await apiClient.post("/retiros", valores);
  return data;
}
