
const API_URL = "/api/catalogo";

async function solicitar(ruta) {
  let respuesta;

  try {
    respuesta = await fetch(`${API_URL}${ruta}`);
  } catch {
    throw new Error(
      "No fue posible conectar con NALU LUXE. " +
      "Verifica que Spring Boot esté funcionando."
    );
  }

  if (!respuesta.ok) {
    throw new Error(
      `Error al consultar el catálogo (${respuesta.status})`
    );
  }

  return respuesta.json();
}

export const catalogoService = {
  obtenerCategorias() {
    return solicitar("/categorias");
  },

  obtenerProductos() {
    return solicitar("/productos");
  },

  obtenerProducto(id) {
    return solicitar(`/productos/${id}`);
  },

  buscarProductos(texto) {
    return solicitar(
      `/productos?buscar=${encodeURIComponent(texto)}`
    );
  },

  obtenerPorCategoria(categoriaId) {
    return solicitar(
      `/productos?categoriaId=${categoriaId}`
    );
  },
};
