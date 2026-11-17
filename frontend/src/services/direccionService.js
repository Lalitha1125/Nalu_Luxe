
const API = "/api/direcciones";

async function solicitar(ruta, metodo, token, datos) {
  if (!token) {
    throw new Error("Debes iniciar sesión.");
  }

  const opciones = {
    method: metodo,
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
    respuesta = await fetch(`${API}${ruta}`, opciones);
  } catch {
    throw new Error(
      "No fue posible conectar con el servidor."
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
      resultado.message ||
      resultado.mensaje ||
      (respuesta.status === 401
        ? "Tu sesión no es válida. Vuelve a iniciar sesión."
        : respuesta.status === 404
          ? "La dirección no existe o no te pertenece."
          : `No se pudo completar la operación (${respuesta.status}).`)
    );
  }

  return resultado;
}

export const direccionService = {
  listar(token) {
    return solicitar("", "GET", token);
  },

  crear(token, datos) {
    return solicitar("", "POST", token, datos);
  },

  actualizar(token, id, datos) {
    return solicitar(`/${id}`, "PUT", token, datos);
  },

  principal(token, id) {
    return solicitar(`/${id}/principal`, "PATCH", token);
  },

  eliminar(token, id) {
    return solicitar(`/${id}`, "DELETE", token);
  },
};
