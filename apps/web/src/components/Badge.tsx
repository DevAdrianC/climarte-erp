interface Props {
  texto: string;
  color: 'gray' | 'blue' | 'green' | 'red' | 'yellow';
}

const COLORES: Record<Props['color'], string> = {
  gray: 'bg-gray-100 text-gray-700',
  blue: 'bg-blue-100 text-blue-700',
  green: 'bg-green-100 text-green-700',
  red: 'bg-red-100 text-red-700',
  yellow: 'bg-yellow-100 text-yellow-700',
};

export function Badge({ texto, color }: Props) {
  return (
    <span className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-medium ${COLORES[color]}`}>
      {texto}
    </span>
  );
}
