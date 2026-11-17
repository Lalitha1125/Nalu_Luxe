
const API = "/api/admin";

async function solicitar(ruta, token, metodo = "GET", datos) {
  if (!token) {
    throw new Error(
      "Debes iniciar sesión como administrador."
    );
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
      "No se pudo conectar con Spring Boot."
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
      (respuesta.status === 403
        ? "Tu cuenta no tiene permisos de administrador."
        : respuesta.status === 401
          ? "Tu sesión no es válida."
          : `Error al procesar la solicitud (${respuesta.status}).`)
    );
  }

  return resultado;
}

export const adminService = {
  resumen(token) {
    return solicitar("/resumen", token);
  },

  productos(token) {
    return solicitar("/productos", token);
  },

  actualizarInventario(token, id, datos) {
    return solicitar(
      `/productos/${id}/inventario`,
      token,
      "PUT",
      datos
    );
  },

  pedidos(token) {
    return solicitar("/pedidos", token);
  },

  cambiarEstado(token, id, estado) {
    return solicitar(
      `/pedidos/${id}/estado`,
      token,
      "PATCH",
      { estado }
    );
  },
};
