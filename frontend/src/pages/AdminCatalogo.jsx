
import { useCallback, useEffect, useState } from "react";

import {
  Plus,
  Pencil,
  Save,
  X,
  RefreshCcw,
  Gem,
} from "lucide-react";

import { useAuth } from "../context/AuthContext";
import { adminCatalogoService } from "../services/adminCatalogoService";

import "../adminCatalogo.css";

const vacio = {
  categoriaId: "",
  sku: "",
  nombre: "",
  descripcion: "",
  material: "",
  color: "",
  precio: "",
  stock: "0",
  imagenPrincipal: "",
  destacado: false,
  activo: true,
  version: null,
};

const dinero = (valor) =>
  new Intl.NumberFormat("es-CO", {
    style: "currency",
    currency: "COP",
    maximumFractionDigits: 0,
  }).format(Number(valor || 0));

export default function AdminCatalogo() {
  const { token } = useAuth();

  const [productos, setProductos] = useState([]);
  const [categorias, setCategorias] = useState([]);
  const [formulario, setFormulario] = useState(vacio);

  const [editandoId, setEditandoId] = useState(null);
  const [mostrarFormulario, setMostrarFormulario] =
    useState(false);

  const [busqueda, setBusqueda] = useState("");
  const [cargando, setCargando] = useState(true);
  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState("");
  const [mensaje, setMensaje] = useState("");

  const cargar = useCallback(async () => {
    setCargando(true);
    setError("");

    try {
      const [datosProductos, datosCategorias] =
        await Promise.all([
          adminCatalogoService.productos(token),
          adminCatalogoService.categorias(token),
        ]);

      setProductos(datosProductos);
      setCategorias(datosCategorias);
    } catch (err) {
      setError(err.message);
    } finally {
      setCargando(false);
    }
  }, [token]);

  useEffect(() => {
    cargar();
  }, [cargar]);

  function nuevo() {
    setFormulario({
      ...vacio,
      categoriaId: categorias[0]?.id
        ? String(categorias[0].id)
        : "",
    });

    setEditandoId(null);
    setMostrarFormulario(true);
    setError("");
    setMensaje("");
  }

  function editar(producto) {
    setFormulario({
      categoriaId: String(producto.categoriaId),
      sku: producto.sku || "",
      nombre: producto.nombre || "",
      descripcion: producto.descripcion || "",
      material: producto.material || "",
      color: producto.color || "",
      precio: String(producto.precio),
      stock: String(producto.stock),
      imagenPrincipal: producto.imagenPrincipal || "",
      destacado: Boolean(producto.destacado),
      activo: Boolean(producto.activo),
      version: producto.version,
    });

    setEditandoId(producto.id);
    setMostrarFormulario(true);
    setError("");
    setMensaje("");

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  }

  function cambiar(evento) {
    const { name, value, checked, type } = evento.target;

    setFormulario((anterior) => ({
      ...anterior,
      [name]: type === "checkbox" ? checked : value,
    }));
  }

  async function guardar(evento) {
    evento.preventDefault();

    setError("");
    setMensaje("");

    const precio = Number(formulario.precio);
    const stock = Number(formulario.stock);

    if (
      !formulario.categoriaId ||
      !formulario.sku.trim() ||
      !formulario.nombre.trim() ||
      formulario.precio.trim() === "" ||
      formulario.stock.trim() === "" ||
      !Number.isFinite(precio) ||
      precio <= 0 ||
      !Number.isSafeInteger(stock) ||
      stock < 0
    ) {
      setError(
        "Comprueba la categoría, el nombre, " +
        "el SKU, el precio y las existencias."
      );
      return;
    }

    const datos = {
      categoriaId: Number(formulario.categoriaId),
      sku: formulario.sku.trim().toUpperCase(),
      nombre: formulario.nombre.trim(),
      descripcion: formulario.descripcion.trim(),
      material: formulario.material.trim(),
      color: formulario.color.trim(),
      precio,
      stock,
      imagenPrincipal: formulario.imagenPrincipal.trim(),
      destacado: formulario.destacado,
      activo: formulario.activo,
      version: formulario.version,
    };

    setGuardando(true);

    try {
      if (editandoId !== null) {
        await adminCatalogoService.actualizar(
          token,
          editandoId,
          datos
        );
      } else {
        await adminCatalogoService.crear(token, datos);
      }

      await cargar();

      setMostrarFormulario(false);
      setEditandoId(null);
      setFormulario({ ...vacio });

      setMensaje(
        editandoId !== null
          ? "Producto actualizado correctamente."
          : "Nueva joya creada correctamente."
      );
    } catch (err) {
      setError(err.message);
    } finally {
      setGuardando(false);
    }
  }

  const filtrados = productos.filter((producto) => {
    const texto = (
      `${producto.nombre} ${producto.sku} ` +
      `${producto.categoria}`
    ).toLowerCase();

    return texto.includes(busqueda.toLowerCase().trim());
  });

  return (
    <section className="nalu-catalog-admin">
      <div className="admin-section-heading">
        <div>
          <h2>Administrar catálogo</h2>
          <p>
            Crea joyas y modifica su información.
          </p>
        </div>

        <div className="nalu-catalog-buttons">
          <button
            type="button"
            className="btn btn-outline"
            onClick={cargar}
            disabled={cargando || guardando}
          >
            <RefreshCcw size={17} />
            Actualizar
          </button>

          <button
            type="button"
            className="btn btn-primary"
            onClick={nuevo}
            disabled={cargando}
          >
            <Plus size={17} />
            Nueva joya
          </button>
        </div>
      </div>

      {error && (
        <div
          className="auth-alert auth-alert-error"
          role="alert"
        >
          {error}
        </div>
      )}

      {mensaje && (
        <div
          className="account-success"
          role="status"
        >
          {mensaje}
        </div>
      )}

      {mostrarFormulario && (
        <div className="admin-card">
          <div className="nalu-catalog-form-heading">
            <h2>
              {editandoId !== null
                ? `Editar joya #${editandoId}`
                : "Crear una nueva joya"}
            </h2>

            <button
              type="button"
              aria-label="Cerrar formulario"
              className="nalu-catalog-close"
              onClick={() => setMostrarFormulario(false)}
            >
              <X size={20} />
            </button>
          </div>

          <form
            className="nalu-catalog-form"
            onSubmit={guardar}
          >
            <div>
              <label htmlFor="joya-categoria">
                Categoría
              </label>

              <select
                id="joya-categoria"
                name="categoriaId"
                required
                value={formulario.categoriaId}
                onChange={cambiar}
              >
                <option value="">
                  Selecciona una categoría
                </option>

                {categorias.map((categoria) => (
                  <option
                    key={categoria.id}
                    value={categoria.id}
                  >
                    {categoria.nombre}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="joya-sku">
                Código SKU
              </label>

              <input
                id="joya-sku"
                name="sku"
                maxLength={40}
                required
                placeholder="NL-AN-011"
                value={formulario.sku}
                onChange={cambiar}
              />
            </div>

            <div className="nalu-catalog-wide">
              <label htmlFor="joya-nombre">
                Nombre de la joya
              </label>

              <input
                id="joya-nombre"
                name="nombre"
                maxLength={150}
                required
                value={formulario.nombre}
                onChange={cambiar}
              />
            </div>

            <div>
              <label htmlFor="joya-material">
                Material
              </label>

              <input
                id="joya-material"
                name="material"
                maxLength={100}
                value={formulario.material}
                onChange={cambiar}
                placeholder="Acero inoxidable..."
              />
            </div>

            <div>
              <label htmlFor="joya-color">
                Color
              </label>

              <input
                id="joya-color"
                name="color"
                maxLength={60}
                value={formulario.color}
                onChange={cambiar}
                placeholder="Dorado, plateado..."
              />
            </div>

            <div>
              <label htmlFor="joya-precio">
                Precio en COP
              </label>

              <input
                id="joya-precio"
                name="precio"
                type="number"
                min="0.01"
                step="0.01"
                required
                value={formulario.precio}
                onChange={cambiar}
              />
            </div>

            <div>
              <label htmlFor="joya-stock">
                Existencias
              </label>

              <input
                id="joya-stock"
                name="stock"
                type="number"
                min="0"
                step="1"
                required
                value={formulario.stock}
                onChange={cambiar}
              />
            </div>

            <div className="nalu-catalog-wide">
              <label htmlFor="joya-descripcion">
                Descripción
              </label>

              <textarea
                id="joya-descripcion"
                name="descripcion"
                rows={4}
                value={formulario.descripcion}
                onChange={cambiar}
                placeholder="Describe las características de la joya..."
              />
            </div>

            <div className="nalu-catalog-wide">
              <label htmlFor="joya-imagen">
                Ruta o URL de la fotografía
              </label>

              <input
                id="joya-imagen"
                name="imagenPrincipal"
                maxLength={500}
                value={formulario.imagenPrincipal}
                onChange={cambiar}
                placeholder="/joyas/catalogo/fotografia.jpg"
              />

              <small>
                Utiliza una ruta existente de
                /joyas/ o una URL HTTPS.
              </small>
            </div>

            <label className="nalu-catalog-check">
              <input
                type="checkbox"
                name="destacado"
                checked={formulario.destacado}
                onChange={cambiar}
              />
              Mostrar como producto destacado
            </label>

            <label className="nalu-catalog-check">
              <input
                type="checkbox"
                name="activo"
                checked={formulario.activo}
                onChange={cambiar}
              />
              Producto activo
            </label>

            <div className="nalu-catalog-wide">
              <button
                type="submit"
                className="btn btn-primary"
                disabled={guardando}
              >
                <Save size={18} />

                {guardando
                  ? "Guardando..."
                  : "Guardar producto"}
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="admin-card">
        <div className="admin-section-heading">
          <div>
            <h2>Joyas registradas</h2>
            <p>
              {productos.length} productos en MySQL.
            </p>
          </div>

          <input
            type="search"
            className="admin-search"
            placeholder="Buscar por nombre o SKU..."
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
          />
        </div>

        {cargando ? (
          <p>Cargando catálogo...</p>
        ) : (
          <div className="admin-table-wrapper">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Joya</th>
                  <th>SKU</th>
                  <th>Precio</th>
                  <th>Stock</th>
                  <th>Estado</th>
                  <th>Acción</th>
                </tr>
              </thead>

              <tbody>
                {filtrados.map((producto) => (
                  <tr key={producto.id}>
                    <td>#{producto.id}</td>

                    <td>
                      <div className="nalu-catalog-product">
                        {producto.imagenPrincipal ? (
                          <img
                            src={producto.imagenPrincipal}
                            alt={producto.nombre}
                            loading="lazy"
                          />
                        ) : (
                          <Gem size={25} />
                        )}

                        <span>{producto.nombre}</span>
                      </div>
                    </td>

                    <td>{producto.sku}</td>
                    <td>{dinero(producto.precio)}</td>
                    <td>{producto.stock}</td>

                    <td>
                      {producto.activo
                        ? "Activo"
                        : "Inactivo"}
                    </td>

                    <td>
                      <button
                        type="button"
                        className="btn btn-outline"
                        onClick={() => editar(producto)}
                      >
                        <Pencil size={16} />
                        Editar
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {!cargando && filtrados.length === 0 && (
          <p>No hay productos con ese criterio.</p>
        )}
      </div>
    </section>
  );
}
