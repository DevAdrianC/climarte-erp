interface Props {
  titulo: string;
  sprint: string;
}

export function ProximamentePage({ titulo, sprint }: Props) {
  return (
    <div className="rounded-xl border border-dashed border-gray-300 bg-white p-10 text-center">
      <h2 className="text-xl font-semibold text-gray-800">{titulo}</h2>
      <p className="mt-2 text-sm text-gray-500">
        Este módulo se construye en el <strong>{sprint}</strong> del Plan de Desarrollo (Parte 4).
      </p>
    </div>
  );
}
