
const API_PERFIL = "/api/perfil";

async function solicitar(method, token, datos) {
  if (!token) {
    throw new Error(
      "Debes iniciar sesión para consultar tu perfil."
    );
  }

  const opciones = {
    method,
    cache: "no-store",
    headers: {
      Accept: "application/json",
      Authorization: `Bearer ${token}`,
    },
  };

  if (datos !== undefined) {
    opciones.headers["Content-Type"] =
      "application/json";

    opciones.body = JSON.stringify(datos);
  }

  let respuesta;

  try {
    respuesta = await fetch(API_PERFIL, opciones);
  } catch {
    throw new Error(
      "No pudimos conectar con el servidor de NALÚ LUXE."
    );
  }

  const tipo =
    respuesta.headers.get("content-type") || "";

  const resultado = tipo.includes("application/json")
    ? await respuesta.json().catch(() => ({}))
    : {};

  if (!respuesta.ok) {
    if (respuesta.status === 401) {
      throw new Error(
        "Tu sesión venció. Inicia sesión nuevamente."
      );
    }

    if (respuesta.status === 403) {
      throw new Error(
        "No tienes permiso para modificar esta cuenta."
      );
    }

    throw new Error(
      resultado.detail ||
      resultado.message ||
      resultado.mensaje ||
      `No se pudo guardar el perfil (${respuesta.status}).`
    );
  }

  return resultado;
}

export const perfilService = {
  obtener(token) {
    return solicitar("GET", token);
  },

  actualizar(token, datos) {
    return solicitar("PUT", token, datos);
  },
};
