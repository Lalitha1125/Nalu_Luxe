
import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";

import {
  LayoutDashboard,
  Gem,
  Package,
  Users,
  AlertTriangle,
  Save,
  RefreshCcw,
  Truck,
  CheckCircle2,
  MessageSquare,
  UserRoundPlus,
  ClipboardList,
} from "lucide-react";

import { useAuth } from "../context/AuthContext";
import { adminService } from "../services/adminService";
import AdminCatalogo from "./AdminCatalogo";

const dinero = (valor) =>
  new Intl.NumberFormat("es-CO", {
    style: "currency",
    currency: "COP",
    maximumFractionDigits: 0,
  }).format(Number(valor || 0));

const PROXIMO_ESTADO = {
  REGISTRADO: "PREPARANDO",
  PREPARANDO: "ENVIADO",
  ENVIADO: "ENTREGADO",
};

const ETIQUETAS = {
  PREPARANDO: "Marcar en preparación",
  ENVIADO: "Marcar como enviado",
  ENTREGADO: "Marcar como entregado",
};

export default function AdminPanel() {
  const { token, usuario } = useAuth();

  const [pestana, setPestana] = useState("resumen");
  const [resumen, setResumen] = useState(null);
  const [productos, setProductos] = useState([]);
  const [pedidos, setPedidos] = useState([]);

  const [ediciones, setEdiciones] = useState({});
  const [busqueda, setBusqueda] = useState("");

  const [cargando, setCargando] = useState(true);
  const [procesando, setProcesando] = useState(false);

  const [error, setError] = useState("");
  const [mensaje, setMensaje] = useState("");

  const cargar = useCallback(async () => {
    setCargando(true);
    setError("");

    try {
      const [r, p, o] = await Promise.all([
        adminService.resumen(token),
        adminService.productos(token),
        adminService.pedidos(token),
      ]);

      setResumen(r);
      setProductos(p);
      setPedidos(o);
      setEdiciones({});
    } catch (err) {
      setError(err.message);
    } finally {
      setCargando(false);
    }
  }, [token]);

  useEffect(() => {
    cargar();
  }, [cargar]);

  function cambiarCampo(id, campo, valor) {
    setEdiciones((actual) => ({
      ...actual,
      [id]: {
        ...actual[id],
        [campo]: valor,
      },
    }));
  }

  function valor(producto, campo) {
    return (
      ediciones[producto.id]?.[campo] ??
      String(producto[campo])
    );
  }

  async function guardarInventario(producto) {
    const precioTexto = valor(producto, "precio");
    const stockTexto = valor(producto, "stock");

    const precio = Number(precioTexto);
    const stock = Number(stockTexto);

    if (
      precioTexto === "" ||
      stockTexto === "" ||
      !Number.isFinite(precio) ||
      precio <= 0 ||
      !Number.isSafeInteger(stock) ||
      stock < 0
    ) {
      setError("Precio o existencias no válidos.");
      return;
    }

    setProcesando(true);
    setError("");
    setMensaje("");

    try {
      await adminService.actualizarInventario(
        token,
        producto.id,
        { precio, stock }
      );

      await cargar();

      setMensaje("Inventario actualizado.");
    } catch (err) {
      setError(err.message);
    } finally {
      setProcesando(false);
    }
  }

  async function cambiarEstado(pedido) {
    const siguiente =
      PROXIMO_ESTADO[pedido.estado];

    if (!siguiente) return;

    if (!window.confirm(
      `¿Cambiar ${pedido.numero} a ${siguiente}?`
    )) {
      return;
    }

    setProcesando(true);
    setError("");
    setMensaje("");

    try {
      await adminService.cambiarEstado(
        token,
        pedido.id,
        siguiente
      );

      await cargar();

      setMensaje("Estado del pedido actualizado.");
    } catch (err) {
      setError(err.message);
    } finally {
      setProcesando(false);
    }
  }

  const filtrados = productos.filter((producto) =>
    producto.nombre
      .toLowerCase()
      .includes(busqueda.toLowerCase().trim())
  );

  return (
    <main className="admin-page">
      <div className="container">
        <div className="admin-heading">
          <div>
            <span className="eyebrow">
              ADMINISTRACIÓN · NALÚ LUXE
            </span>

            <h1>Panel administrativo</h1>

            <p>
              Bienvenido, {usuario?.nombre}.
              Gestiona tu tienda desde un solo lugar.
            </p>
          </div>

          <button
            type="button"
            className="btn btn-outline"
            onClick={cargar}
            disabled={cargando || procesando}
          >
            <RefreshCcw size={17} />
            Actualizar
          </button>
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
            <CheckCircle2 size={19} />
            {mensaje}
          </div>
        )}

        <div className="admin-tabs">
          {[
            {
              id: "resumen",
              texto: "Resumen",
              icono: LayoutDashboard,
            },
            {
              id: "catalogo",
              texto: "Catálogo",
              icono: Gem,
            },
            {
              id: "inventario",
              texto: "Inventario",
              icono: ClipboardList,
            },
            {
              id: "pedidos",
              texto: "Pedidos",
              icono: Package,
            },
          ].map((item) => {
            const Icono = item.icono;

            return (
              <button
                type="button"
                key={item.id}
                className={
                  pestana === item.id ? "active" : ""
                }
                onClick={() => setPestana(item.id)}
              >
                <Icono size={17} />
                {item.texto}
              </button>
            );
          })}
        </div>

        {pestana === "catalogo" ? (
          <AdminCatalogo />
        ) : cargando ? (
          <div className="admin-card">
            Cargando información...
          </div>
        ) : (
          <>
            {pestana === "resumen" && resumen && (
              <>
                <div className="admin-stats">
                  <div className="admin-stat">
                    <Gem size={25} />
                    <span>Productos</span>
                    <strong>{resumen.totalProductos}</strong>
                  </div>

                  <div className="admin-stat">
                    <Users size={25} />
                    <span>Clientes</span>
                    <strong>{resumen.totalClientes}</strong>
                  </div>

                  <div className="admin-stat">
                    <Package size={25} />
                    <span>Pedidos</span>
                    <strong>{resumen.totalPedidos}</strong>
                  </div>

                  <div className="admin-stat">
                    <AlertTriangle size={25} />
                    <span>Sin stock</span>
                    <strong>
                      {resumen.productosSinStock}
                    </strong>
                  </div>
                </div>

                <div className="admin-card">
                  <h2>Valor de pedidos registrados</h2>

                  <div className="admin-money">
                    {dinero(resumen.valorPedidosRegistrados)}
                  </div>

                  <p className="admin-muted">
                    Este valor no representa
                    pagos efectivamente recibidos.
                  </p>
                </div>

                <div className="admin-card">
                  <h2>Herramientas administrativas</h2>

                  <div className="nalu-catalog-buttons">
                    <Link
                      to="/admin/consultas"
                      className="btn btn-outline"
                    >
                      <MessageSquare size={17} />
                      Consultas de clientes
                    </Link>

                    <Link
                      to="/admin/invitaciones"
                      className="btn btn-primary"
                    >
                      <UserRoundPlus size={17} />
                      Invitar administradores
                    </Link>
                  </div>
                </div>
              </>
            )}

            {pestana === "inventario" && (
              <div className="admin-card">
                <div className="admin-section-heading">
                  <div>
                    <h2>Inventario de joyas</h2>
                    <p>
                      Ajusta precios y existencias.
                    </p>
                  </div>

                  <input
                    type="search"
                    className="admin-search"
                    placeholder="Buscar joya..."
                    value={busqueda}
                    onChange={(e) =>
                      setBusqueda(e.target.value)
                    }
                  />
                </div>

                <div className="admin-table-wrapper">
                  <table className="admin-table">
                    <thead>
                      <tr>
                        <th>ID</th>
                        <th>Producto</th>
                        <th>Precio (COP)</th>
                        <th>Stock</th>
                        <th>Guardar</th>
                      </tr>
                    </thead>

                    <tbody>
                      {filtrados.map((producto) => (
                        <tr key={producto.id}>
                          <td>#{producto.id}</td>
                          <td>{producto.nombre}</td>

                          <td>
                            <input
                              type="number"
                              min="0.01"
                              step="0.01"
                              value={valor(
                                producto,
                                "precio"
                              )}
                              onChange={(e) =>
                                cambiarCampo(
                                  producto.id,
                                  "precio",
                                  e.target.value
                                )
                              }
                            />
                          </td>

                          <td>
                            <input
                              type="number"
                              min="0"
                              step="1"
                              value={valor(
                                producto,
                                "stock"
                              )}
                              onChange={(e) =>
                                cambiarCampo(
                                  producto.id,
                                  "stock",
                                  e.target.value
                                )
                              }
                            />
                          </td>

                          <td>
                            <button
                              type="button"
                              className="btn btn-primary"
                              disabled={procesando}
                              onClick={() =>
                                guardarInventario(producto)
                              }
                            >
                              <Save size={16} />
                              Guardar
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {pestana === "pedidos" && (
              <div className="admin-orders">
                {pedidos.length === 0 && (
                  <div className="admin-card">
                    Todavía no hay pedidos registrados.
                  </div>
                )}

                {pedidos.map((pedido) => {
                  const siguiente =
                    PROXIMO_ESTADO[pedido.estado];

                  return (
                    <article
                      key={pedido.id}
                      className="admin-card"
                    >
                      <div className="admin-order-heading">
                        <div>
                          <span className="eyebrow">
                            PEDIDO {pedido.numero}
                          </span>

                          <h2>
                            {dinero(pedido.total)}
                          </h2>

                          <p>
                            Cliente: {pedido.cliente}
                          </p>

                          <p className="admin-muted">
                            {pedido.correo}
                          </p>
                        </div>

                        <span className="order-status">
                          {pedido.estado}
                        </span>
                      </div>

                      <p className="admin-muted">
                        Dirección:
                        {" "}{pedido.direccionEntrega}
                      </p>

                      <div className="order-products">
                        {(pedido.productos || []).map(
                          (item, i) => (
                            <div key={i}>
                              <span>
                                {item.nombreProducto}
                                {" × "}{item.cantidad}
                              </span>

                              <strong>
                                {dinero(item.subtotal)}
                              </strong>
                            </div>
                          )
                        )}
                      </div>

                      {siguiente ? (
                        <button
                          type="button"
                          className="btn btn-primary"
                          disabled={procesando}
                          onClick={() =>
                            cambiarEstado(pedido)
                          }
                        >
                          <Truck size={18} />
                          {ETIQUETAS[siguiente]}
                        </button>
                      ) : (
                        <p className="admin-muted">
                          No hay más cambios de estado
                          disponibles para este pedido.
                        </p>
                      )}
                    </article>
                  );
                })}
              </div>
            )}
          </>
        )}
      </div>
    </main>
  );
}
