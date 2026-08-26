import { Routes, Route } from 'react-router-dom';
import { Layout } from './components/Layout';
import { RutaProtegida } from './components/RutaProtegida';
import { LoginPage } from './pages/LoginPage';
import { DashboardPage } from './pages/DashboardPage';
import { ProximamentePage } from './pages/ProximamentePage';
import { ClientesPage } from './pages/clientes/ClientesPage';
import { ClienteDetallePage } from './pages/clientes/ClienteDetallePage';
import { TrabajosPage } from './pages/trabajos/TrabajosPage';
import { TrabajoDetallePage } from './pages/trabajos/TrabajoDetallePage';

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />

      <Route element={<RutaProtegida />}>
        <Route element={<Layout />}>
          <Route path="/" element={<DashboardPage />} />
          <Route path="/clientes" element={<ClientesPage />} />
          <Route path="/clientes/:id" element={<ClienteDetallePage />} />
          <Route path="/trabajos" element={<TrabajosPage />} />
          <Route path="/trabajos/:id" element={<TrabajoDetallePage />} />
          <Route
            path="/gastos"
            element={<ProximamentePage titulo="Gastos" sprint="Sprint 4" />}
          />
          <Route
            path="/vehiculo"
            element={<ProximamentePage titulo="Vehículo" sprint="Sprint 4" />}
          />
          <Route
            path="/herramientas"
            element={<ProximamentePage titulo="Herramientas" sprint="Sprint 4" />}
          />
          <Route
            path="/liquidacion"
            element={<ProximamentePage titulo="Liquidación mensual" sprint="Sprint 5" />}
          />
          <Route
            path="/reportes"
            element={<ProximamentePage titulo="Reportes" sprint="Sprint 7" />}
          />
          <Route
            path="/auditoria"
            element={<ProximamentePage titulo="Auditoría" sprint="Sprint 7" />}
          />
          <Route
            path="/socios"
            element={<ProximamentePage titulo="Socios" sprint="Sprint 1 (ya disponible por API)" />}
          />
        </Route>
      </Route>
    </Routes>
  );
}
