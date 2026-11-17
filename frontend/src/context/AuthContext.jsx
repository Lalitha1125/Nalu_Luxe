
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";

import {
  authService,
  CLAVE_SESION,
} from "../services/authService";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [usuario, setUsuario] = useState(null);

  const [token, setToken] = useState(() =>
    sessionStorage.getItem(CLAVE_SESION)
  );

  const [verificandoSesion, setVerificandoSesion] =
    useState(true);

  const limpiarSesion = useCallback(() => {
    sessionStorage.removeItem(CLAVE_SESION);

    setToken(null);
    setUsuario(null);
  }, []);

  useEffect(() => {
    let activo = true;

    async function comprobarSesion() {
      setVerificandoSesion(true);

      if (!token) {
        setUsuario(null);
        setVerificandoSesion(false);
        return;
      }

      try {
        const perfil =
          await authService.obtenerMiPerfil(token);

        if (activo) {
          setUsuario(perfil);
        }
      } catch {
        if (activo) {
          limpiarSesion();
        }
      } finally {
        if (activo) {
          setVerificandoSesion(false);
        }
      }
    }

    comprobarSesion();

    return () => {
      activo = false;
    };
  }, [token, limpiarSesion]);

  const iniciarSesion = useCallback((respuesta) => {
    if (!respuesta?.token || !respuesta?.usuario) {
      throw new Error(
        "El servidor no devolvió una sesión válida."
      );
    }

    sessionStorage.setItem(
      CLAVE_SESION,
      respuesta.token
    );

    setToken(respuesta.token);
    setUsuario(respuesta.usuario);
  }, []);

  const refrescarUsuario = useCallback(async () => {
    const tokenActual =
      sessionStorage.getItem(CLAVE_SESION);

    if (!tokenActual) {
      limpiarSesion();
      throw new Error("La sesión no está disponible.");
    }

    try {
      const perfil =
        await authService.obtenerMiPerfil(tokenActual);

      setUsuario(perfil);

      return perfil;
    } catch (error) {
      limpiarSesion();
      throw error;
    }
  }, [limpiarSesion]);

  const cerrarSesion = useCallback(async () => {
    const tokenActual =
      sessionStorage.getItem(CLAVE_SESION);

    limpiarSesion();

    if (tokenActual) {
      await authService.cerrarSesion(tokenActual);
    }
  }, [limpiarSesion]);

  return (
    <AuthContext.Provider
      value={{
        usuario,
        token,
        verificandoSesion,
        autenticado: Boolean(usuario && token),
        esAdmin: usuario?.rol === "ADMIN",
        iniciarSesion,
        cerrarSesion,
        refrescarUsuario,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const contexto = useContext(AuthContext);

  if (!contexto) {
    throw new Error(
      "useAuth debe utilizarse dentro de AuthProvider."
    );
  }

  return contexto;
}
