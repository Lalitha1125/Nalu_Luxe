
async function solicitar(ruta, metodo, datos, token) {
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
    respuesta = await fetch(ruta, {
      method: metodo,
      headers,
      cache: "no-store",
      ...(datos !== undefined
        ? { body: JSON.stringify(datos) }
        : {}),
    });
  } catch {
    throw new Error(
      "No se pudo conectar con NALÚ LUXE."
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
      `La solicitud falló (${respuesta.status}).`
    );
  }

  return resultado;
}

export const consultaService = {
  enviar(datos) {
    return solicitar(
      "/api/consultas",
      "POST",
      datos
    );
  },

  listar(token) {
    return solicitar(
      "/api/admin/consultas",
      "GET",
      undefined,
      token
    );
  },

  cambiarEstado(token, id, estado) {
    return solicitar(
      `/api/admin/consultas/${id}/estado`,
      "PATCH",
      { estado },
      token
    );
  },
};
