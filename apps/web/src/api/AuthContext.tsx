import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { apiClient, guardarTokens, limpiarTokens, obtenerAccessToken } from './client';

interface UsuarioAutenticado {
  id: string;
  nombre: string;
  email: string;
  rol: 'ADMIN_SOCIO' | 'TECNICO' | 'ADMINISTRATIVO';
}

interface AuthContextValue {
  usuario: UsuarioAutenticado | null;
  cargando: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [usuario, setUsuario] = useState<UsuarioAutenticado | null>(() => {
    const guardado = localStorage.getItem('climarte_usuario');
    return guardado ? JSON.parse(guardado) : null;
  });
  const [cargando, setCargando] = useState(false);

  useEffect(() => {
    // Si no hay token de acceso pero sí hay usuario guardado, se limpia
    // (evita mostrar una sesión "activa" sin tokens válidos).
    if (!obtenerAccessToken() && usuario) {
      setUsuario(null);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function login(email: string, password: string) {
    setCargando(true);
    try {
      const { data } = await apiClient.post('/auth/login', { email, password });
      guardarTokens(data.accessToken, data.refreshToken);
      localStorage.setItem('climarte_usuario', JSON.stringify(data.usuario));
      setUsuario(data.usuario);
    } finally {
      setCargando(false);
    }
  }

  function logout() {
    limpiarTokens();
    localStorage.removeItem('climarte_usuario');
    setUsuario(null);
  }

  return (
    <AuthContext.Provider value={{ usuario, cargando, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth debe usarse dentro de <AuthProvider>');
  return ctx;
}
