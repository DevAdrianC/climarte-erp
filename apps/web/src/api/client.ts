import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:3000/api';

export const apiClient = axios.create({ baseURL: API_URL });

// Guardar el refresh token en localStorage es una simplificación válida para el
// MVP (equipo de 2 socios, sin requisitos de seguridad extremos todavía). Si en
// el futuro hace falta más seguridad, se migra a cookies httpOnly (Parte 3 §14).
const ACCESS_TOKEN_KEY = 'climarte_access_token';
const REFRESH_TOKEN_KEY = 'climarte_refresh_token';

export function guardarTokens(accessToken: string, refreshToken: string) {
  localStorage.setItem(ACCESS_TOKEN_KEY, accessToken);
  localStorage.setItem(REFRESH_TOKEN_KEY, refreshToken);
}

export function limpiarTokens() {
  localStorage.removeItem(ACCESS_TOKEN_KEY);
  localStorage.removeItem(REFRESH_TOKEN_KEY);
}

export function obtenerAccessToken() {
  return localStorage.getItem(ACCESS_TOKEN_KEY);
}

apiClient.interceptors.request.use((config) => {
  const token = obtenerAccessToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

let refrescandoPromise: Promise<string> | null = null;

apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const original = error.config;
    const esErrorDeAuth = error.response?.status === 401;
    const yaReintento = original?._retry;
    const esLlamadaDeAuth =
      original?.url?.includes('/auth/refresh') || original?.url?.includes('/auth/login');
    const refreshToken = localStorage.getItem(REFRESH_TOKEN_KEY);

    // Si la que falló con 401 es justamente la llamada de refresh (o de login), no hay
    // que intentar refrescar de nuevo — eso generaba un bucle infinito. Se cierra la
    // sesión directamente.
    if (esErrorDeAuth && esLlamadaDeAuth) {
      limpiarTokens();
      if (window.location.pathname !== '/login') {
        window.location.href = '/login';
      }
      return Promise.reject(error);
    }

    if (esErrorDeAuth && !yaReintento && refreshToken) {
      original._retry = true;
      try {
        refrescandoPromise ??= apiClient
          .post('/auth/refresh', { refreshToken })
          .then(({ data }) => {
            guardarTokens(data.accessToken, data.refreshToken);
            return data.accessToken as string;
          })
          .finally(() => {
            refrescandoPromise = null;
          });

        const nuevoAccessToken = await refrescandoPromise;
        original.headers.Authorization = `Bearer ${nuevoAccessToken}`;
        return apiClient(original);
      } catch {
        limpiarTokens();
        if (window.location.pathname !== '/login') {
          window.location.href = '/login';
        }
      }
    }

    return Promise.reject(error);
  },
);
