import { NavLink, Outlet } from 'react-router-dom';
import { useAuth } from '../api/AuthContext';

const modulos = [
  { to: '/', label: 'Dashboard' },
  { to: '/clientes', label: 'Clientes' },
  { to: '/trabajos', label: 'Trabajos' },
  { to: '/gastos', label: 'Gastos' },
  { to: '/vehiculo', label: 'Vehículo' },
  { to: '/herramientas', label: 'Herramientas' },
  { to: '/liquidacion', label: 'Liquidación mensual' },
  { to: '/reportes', label: 'Reportes' },
  { to: '/auditoria', label: 'Auditoría' },
  { to: '/socios', label: 'Socios' },
];

export function Layout() {
  const { usuario, logout } = useAuth();

  return (
    <div className="flex min-h-screen">
      <aside className="w-60 shrink-0 border-r border-gray-200 bg-white">
        <div className="border-b border-gray-200 px-4 py-4">
          <h1 className="text-lg font-bold text-climarte-dark">CLIMARTE</h1>
          <p className="text-xs text-gray-500">ERP interno</p>
        </div>
        <nav className="flex flex-col gap-1 p-2">
          {modulos.map((m) => (
            <NavLink
              key={m.to}
              to={m.to}
              end={m.to === '/'}
              className={({ isActive }) =>
                `rounded-md px-3 py-2 text-sm font-medium transition ${
                  isActive
                    ? 'bg-climarte/10 text-climarte-dark'
                    : 'text-gray-600 hover:bg-gray-100'
                }`
              }
            >
              {m.label}
            </NavLink>
          ))}
        </nav>
      </aside>

      <div className="flex flex-1 flex-col">
        <header className="flex items-center justify-between border-b border-gray-200 bg-white px-6 py-3">
          <span className="text-sm text-gray-500">
            {new Date().toLocaleDateString('es-AR', {
              weekday: 'long',
              day: 'numeric',
              month: 'long',
              year: 'numeric',
            })}
          </span>
          <div className="flex items-center gap-3">
            <span className="text-sm font-medium text-gray-700">{usuario?.nombre}</span>
            <button
              onClick={logout}
              className="rounded-md border border-gray-300 px-3 py-1 text-xs font-medium text-gray-600 hover:bg-gray-100"
            >
              Cerrar sesión
            </button>
          </div>
        </header>

        <main className="flex-1 p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
