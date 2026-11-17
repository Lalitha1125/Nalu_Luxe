
async function solicitar(ruta, token, datos) {
  if (!token) {
    throw new Error("Debes iniciar sesión.");
  }

  let respuesta;

  try {
    respuesta = await fetch(ruta, {
      method: "POST",
      cache: "no-store",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(datos),
    });
  } catch {
    throw new Error(
      "No se pudo conectar con el servidor."
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
        ? "Tu sesión venció. Vuelve a iniciar sesión."
        : respuesta.status === 403
          ? "No tienes permiso para esta operación."
          : `Error al procesar la invitación (${respuesta.status}).`)
    );
  }

  return resultado;
}

export const invitacionAdminService = {
  crear(token, correo) {
    return solicitar(
      "/api/admin/invitaciones",
      token,
      { correo }
    );
  },

  aceptar(token, codigo) {
    return solicitar(
      "/api/invitaciones-admin/aceptar",
      token,
      { token: codigo }
    );
  },
};
