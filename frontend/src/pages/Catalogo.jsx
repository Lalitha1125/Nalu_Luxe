
import { useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { Search, SlidersHorizontal } from "lucide-react";

import ProductCard from "../components/ProductCard";

export default function Catalogo({
  productos,
  categorias,
  cargando,
  error,
  agregarAlCarrito,
}) {
  const [parametros, setParametros] = useSearchParams();
  const [busqueda, setBusqueda] = useState("");
  const [orden, setOrden] = useState("nombre");

  const categoriaSeleccionada =
    parametros.get("categoria") || "";

  const cambiarCategoria = (nombre) => {
    if (nombre) {
      setParametros({ categoria: nombre });
    } else {
      setParametros({});
    }
  };

  const filtrados = useMemo(() => {
    const texto = busqueda.trim().toLocaleLowerCase("es-CO");

    const lista = productos.filter((producto) => {
      const coincideCategoria =
        !categoriaSeleccionada ||
        producto.categoria?.nombre === categoriaSeleccionada;

      const contenido = [
        producto.nombre,
        producto.descripcion,
        producto.material,
      ]
        .filter(Boolean)
        .join(" ")
        .toLocaleLowerCase("es-CO");

      return coincideCategoria && contenido.includes(texto);
    });

    return [...lista].sort((a, b) => {
      if (orden === "precio-asc") {
        return Number(a.precio) - Number(b.precio);
      }

      if (orden === "precio-desc") {
        return Number(b.precio) - Number(a.precio);
      }

      return a.nombre.localeCompare(b.nombre, "es");
    });
  }, [productos, categoriaSeleccionada, busqueda, orden]);

  return (
    <main className="container catalog-page">
      <div className="page-heading">
        <span className="eyebrow">NALÚ LUXE</span>
        <h1>Nuestro catálogo</h1>
        <p>
          Encuentra la joya perfecta para cada ocasión.
        </p>
      </div>

      <div className="catalog-layout">
        <aside className="catalog-sidebar">
          <h3>
            <SlidersHorizontal size={20} />
            Categorías
          </h3>

          <button
            type="button"
            className={!categoriaSeleccionada ? "active" : ""}
            onClick={() => cambiarCategoria("")}
          >
            Todas las joyas
          </button>

          {categorias.map((categoria) => (
            <button
              key={categoria.id}
              type="button"
              className={
                categoriaSeleccionada === categoria.nombre
                  ? "active"
                  : ""
              }
              onClick={() => cambiarCategoria(categoria.nombre)}
            >
              {categoria.nombre}
            </button>
          ))}

          <div className="sidebar-note">
            <span>✦</span>
            <p>
              Accesorios seleccionados para resaltar tu esencia.
            </p>
          </div>
        </aside>

        <section className="catalog-content">
          <div className="catalog-tools">
            <label className="search-box">
              <Search size={19} />
              <input
                type="search"
                placeholder="Buscar una joya..."
                value={busqueda}
                onChange={(e) => setBusqueda(e.target.value)}
              />
            </label>

            <select
              value={orden}
              aria-label="Ordenar productos"
              onChange={(e) => setOrden(e.target.value)}
            >
              <option value="nombre">Nombre A-Z</option>
              <option value="precio-asc">Menor precio</option>
              <option value="precio-desc">Mayor precio</option>
            </select>
          </div>

          <div className="catalog-results">
            <strong>
              {cargando
                ? "Cargando productos..."
                : `${filtrados.length} joyas encontradas`}
            </strong>

            {categoriaSeleccionada && (
              <button
                type="button"
                onClick={() => cambiarCategoria("")}
              >
                Quitar filtro ×
              </button>
            )}
          </div>

          {error && (
            <div className="error-message">{error}</div>
          )}

          {!cargando && !error && (
            <>
              <div className="products-grid">
                {filtrados.map((producto) => (
                  <ProductCard
                    key={producto.id}
                    producto={producto}
                    agregarAlCarrito={agregarAlCarrito}
                  />
                ))}
              </div>

              {filtrados.length === 0 && (
                <div className="empty-state">
                  <h3>No encontramos joyas</h3>
                  <p>
                    Prueba con otra palabra o categoría.
                  </p>

                  <button
                    type="button"
                    className="btn btn-primary"
                    onClick={() => {
                      cambiarCategoria("");
                      setBusqueda("");
                    }}
                  >
                    Ver todo el catálogo
                  </button>
                </div>
              )}
            </>
          )}
        </section>
      </div>
    </main>
  );
}
