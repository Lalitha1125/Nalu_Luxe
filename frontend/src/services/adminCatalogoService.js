
const API = "/api/admin/catalogo";

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
      "No fue posible conectar con Spring Boot."
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
      (respuesta.status === 403
        ? "No tienes permisos de administrador."
        : respuesta.status === 409
          ? "Los datos cambiaron o el SKU ya existe."
          : `Error HTTP ${respuesta.status}.`)
    );
  }

  return resultado;
}

export const adminCatalogoService = {
  categorias(token) {
    return solicitar("/categorias", token);
  },

  productos(token) {
    return solicitar("/productos", token);
  },

  crear(token, datos) {
    return solicitar("/productos", token, "POST", datos);
  },

  actualizar(token, id, datos) {
    return solicitar(
      `/productos/${id}`,
      token,
      "PUT",
      datos
    );
  },
};
