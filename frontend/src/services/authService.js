
const API_AUTH = "/api/auth";

export const CLAVE_SESION = "nalu_luxe_token";

async function solicitar(
  ruta,
  { method = "GET", datos, token } = {}
) {
  const headers = {
    Accept: "application/json",
  };

  if (datos !== undefined) {
    headers["Content-Type"] = "application/json";
  }

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  let respuesta;

  try {
    respuesta = await fetch(`${API_AUTH}${ruta}`, {
      method,
      headers,
      cache: "no-store",
      ...(datos !== undefined
        ? { body: JSON.stringify(datos) }
        : {}),
    });
  } catch {
    throw new Error(
      "No pudimos conectar con NALÚ LUXE. " +
      "Comprueba que Spring Boot esté funcionando."
    );
  }

  const tipo =
    respuesta.headers.get("content-type") || "";

  const resultado = tipo.includes("application/json")
    ? await respuesta.json().catch(() => ({}))
    : {};

  if (!respuesta.ok) {
    throw new Error(
      resultado.detail ||
      resultado.mensaje ||
      resultado.message ||
      (respuesta.status === 401
        ? "Credenciales incorrectas o sesión vencida."
        : respuesta.status === 403
          ? "No tienes permiso para realizar esta acción."
          : respuesta.status === 409
            ? "El correo ya está registrado."
            : respuesta.status === 429
              ? "Espera un minuto antes de solicitar otro código."
              : `Error del servidor (${respuesta.status}).`)
    );
  }

  return resultado;
}

export const authService = {
  registrar(datos) {
    return solicitar("/registro", {
      method: "POST",
      datos,
    });
  },

  verificarCorreo(correo, codigo) {
    return solicitar("/verificar-correo", {
      method: "POST",
      datos: { correo, codigo },
    });
  },

  reenviarRegistro(correo) {
    return solicitar("/reenviar-registro", {
      method: "POST",
      datos: { correo },
    });
  },

  iniciarSesion(correo, contrasena) {
    return solicitar("/login", {
      method: "POST",
      datos: { correo, contrasena },
    });
  },

  verificarLogin(correo, codigo) {
    return solicitar("/verificar-login", {
      method: "POST",
      datos: { correo, codigo },
    });
  },

  obtenerMiPerfil(token) {
    return solicitar("/me", { token });
  },

  cerrarSesion(token) {
    return solicitar("/logout", {
      method: "POST",
      token,
    });
  },

  solicitarRecuperacion(correo) {
    return solicitar("/recuperar-clave", {
      method: "POST",
      datos: { correo },
    });
  },

  restablecerClave(correo, codigo, nuevaContrasena) {
    return solicitar("/restablecer-clave", {
      method: "POST",
      datos: {
        correo,
        codigo,
        nuevaContrasena,
      },
    });
  },
};
