import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../api/AuthContext';

export function RutaProtegida() {
  const { usuario } = useAuth();

  if (!usuario) {
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
}
