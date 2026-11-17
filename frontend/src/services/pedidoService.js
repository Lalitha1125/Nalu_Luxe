
const API = "/api/pedidos";

async function pedir(ruta, token, metodo = "GET", datos) {
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
      "No hay conexión. Comprueba el estado del pedido " +
      "antes de intentar enviarlo de nuevo."
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
      (respuesta.status === 409
        ? "No hay suficientes existencias."
        : `La operación falló (${respuesta.status}).`)
    );
  }

  return resultado;
}

export const pedidoService = {
  crear(token, datos) {
    return pedir("", token, "POST", datos);
  },

  listar(token) {
    return pedir("", token);
  },

  consultar(token, id) {
    return pedir(`/${id}`, token);
  },
};
