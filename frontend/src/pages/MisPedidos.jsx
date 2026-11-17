
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

import {
  ArrowLeft,
  ArrowRight,
  ShoppingBag,
  Package,
  PackageCheck,
  Truck,
  CheckCircle2,
  Clock3,
  MapPin,
  CalendarDays,
  ChevronDown,
  ChevronUp,
  Gem,
  RefreshCcw,
  ReceiptText,
  Sparkles,
  AlertCircle,
} from "lucide-react";

import { useAuth } from "../context/AuthContext";
import { pedidoService } from "../services/pedidoService";

import "../misPedidos.css";

// ============================================
// FORMATO DE MONEDA COLOMBIANA
// ============================================

function formatoPrecio(valor) {
  return new Intl.NumberFormat("es-CO", {
    style: "currency",
    currency: "COP",
    maximumFractionDigits: 0,
  }).format(Number(valor || 0));
}

// ============================================
// FORMATO DE FECHA
// ============================================

function formatoFecha(fecha) {
  if (!fecha) return "Fecha no disponible";

  const partes = fecha.split("T");
  const fechaParte = partes[0];

  if (!fechaParte) return fecha;

  const [anio, mes, dia] = fechaParte.split("-").map(Number);

  if (!anio || !mes || !dia) return fecha;

  const fechaLocal = new Date(anio, mes - 1, dia);

  return new Intl.DateTimeFormat("es-CO", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(fechaLocal);
}

// ============================================
// ESTADOS DEL PEDIDO
// ============================================

const ETAPAS = [
  {
    codigo: "REGISTRADO",
    titulo: "Registrado",
    descripcion: "Pedido recibido",
    icono: ReceiptText,
  },
  {
    codigo: "PREPARANDO",
    titulo: "Preparando",
    descripcion: "Preparando tus joyas",
    icono: Package,
  },
  {
    codigo: "ENVIADO",
    titulo: "Enviado",
    descripcion: "Pedido en camino",
    icono: Truck,
  },
  {
    codigo: "ENTREGADO",
    titulo: "Entregado",
    descripcion: "Entrega completada",
    icono: PackageCheck,
  },
];

function obtenerEtapa(estado) {
  return ETAPAS.findIndex(
    (etapa) => etapa.codigo === estado
  );
}

function obtenerTituloEstado(estado) {
  return (
    ETAPAS.find((etapa) => etapa.codigo === estado)
      ?.titulo || estado
  );
}

// ============================================
// TARJETA DE PEDIDO
// ============================================

function TarjetaPedido({ pedido }) {
  const [expandido, setExpandido] = useState(false);

  const etapaActual = obtenerEtapa(pedido.estado);
  const entregado = pedido.estado === "ENTREGADO";

  const unidades = (pedido.productos || []).reduce(
    (total, producto) =>
      total + Number(producto.cantidad || 0),
    0
  );

  return (
    <article className="nalu-order-card">
      {/* CABECERA */}

      <div className="nalu-order-card-header">
        <div className="nalu-order-header-left">
          <div className="nalu-order-number-icon">
            <ShoppingBag size={22} />
          </div>

          <div className="nalu-order-header-info">
            <span className="nalu-order-overline">
              NALÚ LUXE · TU COMPRA
            </span>

            <h2>Pedido #{pedido.numero}</h2>

            <span className="nalu-order-date">
              <CalendarDays size={15} />
              {formatoFecha(pedido.fecha)}
            </span>
          </div>
        </div>

        <div className="nalu-order-header-right">
          <span
            className={
              "nalu-order-status " +
              (entregado
                ? "nalu-order-status-delivered"
                : "nalu-order-status-active")
            }
          >
            {entregado ? (
              <CheckCircle2 size={15} />
            ) : (
              <Clock3 size={15} />
            )}

            {obtenerTituloEstado(pedido.estado)}
          </span>

          <strong className="nalu-order-header-total">
            {formatoPrecio(pedido.total)}
          </strong>
        </div>
      </div>

      {/* SEGUIMIENTO */}

      <div className="nalu-order-tracking">
        <div className="nalu-order-tracking-title">
          <div>
            <span className="nalu-order-overline">
              SEGUIMIENTO DE TU PEDIDO
            </span>

            <h3>
              {entregado
                ? "¡Tus joyas han llegado!"
                : etapaActual >= 0
                  ? `Estado: ${obtenerTituloEstado(pedido.estado)}`
                  : `Estado: ${pedido.estado}`}
            </h3>
          </div>

          {etapaActual >= 0 && (
            <span className="nalu-order-step-count">
              Etapa {etapaActual + 1} de {ETAPAS.length}
            </span>
          )}
        </div>

        <div className="nalu-order-progress">
          {ETAPAS.map((etapa, indice) => {
            const Icono = etapa.icono;
            const completada =
              etapaActual >= 0 && indice <= etapaActual;

            const actual = indice === etapaActual;

            return (
              <div
                key={etapa.codigo}
                className={
                  "nalu-order-progress-step " +
                  (completada ? "completed " : "") +
                  (actual ? "current" : "")
                }
              >
                <div className="nalu-order-progress-circle">
                  {indice < etapaActual ? (
                    <CheckCircle2 size={19} />
                  ) : (
                    <Icono size={19} />
                  )}
                </div>

                <strong>{etapa.titulo}</strong>

                <small>{etapa.descripcion}</small>
              </div>
            );
          })}
        </div>

        <div className="nalu-order-progress-bar">
          {ETAPAS.map((etapa, indice) => (
            <span
              key={etapa.codigo}
              className={
                etapaActual >= indice ? "filled" : ""
              }
            />
          ))}
        </div>

        <p className="nalu-order-tracking-note">
          <Sparkles size={15} />

          {entregado
            ? "Este pedido figura como entregado."
            : "Puedes consultar aquí los cambios de estado de tu pedido."}
        </p>
      </div>

      {/* PRODUCTOS */}

      <div className="nalu-order-section">
        <div className="nalu-order-section-title">
          <h3>
            <Gem size={19} />
            Las joyas de tu pedido
          </h3>

          <span>
            {unidades} {unidades === 1 ? "unidad" : "unidades"}
          </span>
        </div>

        <div className="nalu-order-products">
          {(pedido.productos || []).map((producto, indice) => (
            <div
              key={`${producto.productoId}-${indice}`}
              className="nalu-order-product"
            >
              <div className="nalu-order-product-icon">
                <Gem size={24} strokeWidth={1.4} />
              </div>

              <div className="nalu-order-product-info">
                <h4>{producto.nombreProducto}</h4>

                <p>
                  {producto.cantidad}
                  {" "}
                  {producto.cantidad === 1
                    ? "unidad"
                    : "unidades"}
                  {" · "}
                  {formatoPrecio(producto.precioUnitario)}
                  {" por unidad"}
                </p>
              </div>

              <strong>
                {formatoPrecio(producto.subtotal)}
              </strong>
            </div>
          ))}
        </div>
      </div>

      {/* RESUMEN */}

      <div className="nalu-order-summary">
        <div>
          <span>Subtotal</span>
          <strong>{formatoPrecio(pedido.subtotal)}</strong>
        </div>

        <div>
          <span>Costo de envío registrado</span>
          <strong>{formatoPrecio(pedido.costoEnvio)}</strong>
        </div>

        <div className="nalu-order-summary-total">
          <span>Total del pedido</span>
          <strong>{formatoPrecio(pedido.total)}</strong>
        </div>
      </div>

      {/* MÁS DETALLES */}

      <button
        type="button"
        className="nalu-order-expand-button"
        onClick={() => setExpandido((anterior) => !anterior)}
        aria-expanded={expandido}
      >
        {expandido
          ? "Ocultar detalles del pedido"
          : "Ver detalles de entrega"}

        {expandido ? (
          <ChevronUp size={19} />
        ) : (
          <ChevronDown size={19} />
        )}
      </button>

      {expandido && (
        <div className="nalu-order-extra">
          <div className="nalu-order-extra-item">
            <MapPin size={20} />

            <div>
              <strong>Dirección de entrega</strong>
              <p>{pedido.direccionEntrega}</p>
            </div>
          </div>

          <div className="nalu-order-extra-item">
            <ReceiptText size={20} />

            <div>
              <strong>Número de pedido</strong>
              <p>{pedido.numero}</p>
            </div>
          </div>

          {pedido.observaciones && (
            <div className="nalu-order-extra-item">
              <Package size={20} />

              <div>
                <strong>Observaciones</strong>
                <p>{pedido.observaciones}</p>
              </div>
            </div>
          )}

          <p className="nalu-order-payment-note">
            Este es el registro de tu pedido.
            No constituye un comprobante de pago.
          </p>
        </div>
      )}
    </article>
  );
}

// ============================================
// PÁGINA MIS PEDIDOS
// ============================================

export default function MisPedidos() {
  const { token } = useAuth();

  const [pedidos, setPedidos] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [actualizando, setActualizando] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    let activo = true;

    async function cargar() {
      setCargando(true);
      setError("");

      try {
        const datos = await pedidoService.listar(token);

        if (activo) {
          setPedidos(datos);
        }
      } catch (err) {
        if (activo) {
          setError(err.message);
        }
      } finally {
        if (activo) {
          setCargando(false);
        }
      }
    }

    if (token) {
      cargar();
    }

    return () => {
      activo = false;
    };
  }, [token]);

  async function actualizarPedidos() {
    setActualizando(true);
    setError("");

    try {
      const datos = await pedidoService.listar(token);
      setPedidos(datos);
    } catch (err) {
      setError(err.message);
    } finally {
      setActualizando(false);
    }
  }

  const totalRegistrado = pedidos.reduce(
    (total, pedido) =>
      total + Number(pedido.total || 0),
    0
  );

  const pedidosActivos = pedidos.filter(
    (pedido) => pedido.estado !== "ENTREGADO"
  ).length;

  const pedidosEntregados = pedidos.filter(
    (pedido) => pedido.estado === "ENTREGADO"
  ).length;

  return (
    <main className="nalu-orders-page">
      <div className="container">
        {/* REGRESAR AL PERFIL */}

        <Link
          to="/mi-cuenta"
          className="back-link nalu-orders-back"
        >
          <ArrowLeft size={18} />
          Volver a mi cuenta
        </Link>

        {/* ENCABEZADO */}

        <div className="nalu-orders-heading">
          <div className="nalu-orders-heading-icon">
            <ShoppingBag size={28} />
          </div>

          <span className="eyebrow">
            TU HISTORIAL · NALÚ LUXE
          </span>

          <h1>Mis pedidos</h1>

          <p>
            Cada joya tiene una historia.
            Consulta tus compras y sigue
            el estado de tus pedidos.
          </p>
        </div>

        {/* CARGANDO */}

        {cargando ? (
          <div className="nalu-orders-loading">
            <Package size={34} />
            <p>Cargando tus pedidos...</p>
          </div>
        ) : (
          <>
            {/* MENSAJES DE ERROR */}

            {error && (
              <div
                className="auth-alert auth-alert-error"
                role="alert"
              >
                <AlertCircle size={18} />
                {error}
              </div>
            )}

            {/* RESUMEN DE PEDIDOS */}

            <div className="nalu-orders-stats">
              <div className="nalu-orders-stat">
                <div className="nalu-orders-stat-icon">
                  <ShoppingBag size={23} />
                </div>

                <span>Pedidos realizados</span>
                <strong>{pedidos.length}</strong>
              </div>

              <div className="nalu-orders-stat">
                <div className="nalu-orders-stat-icon">
                  <Truck size={23} />
                </div>

                <span>Pedidos por entregar</span>
                <strong>{pedidosActivos}</strong>
              </div>

              <div className="nalu-orders-stat">
                <div className="nalu-orders-stat-icon">
                  <CheckCircle2 size={23} />
                </div>

                <span>Pedidos entregados</span>
                <strong>{pedidosEntregados}</strong>
              </div>

              <div className="nalu-orders-stat">
                <div className="nalu-orders-stat-icon">
                  <Gem size={23} />
                </div>

                <span>Valor registrado</span>
                <strong className="nalu-orders-money">
                  {formatoPrecio(totalRegistrado)}
                </strong>
              </div>
            </div>

            {/* CABECERA DEL HISTORIAL */}

            <div className="nalu-orders-list-heading">
              <div>
                <span className="eyebrow">
                  MIS COMPRAS
                </span>

                <h2>Historial de pedidos</h2>
              </div>

              <button
                type="button"
                className="btn btn-outline"
                onClick={actualizarPedidos}
                disabled={actualizando}
              >
                <RefreshCcw size={17} />
                {actualizando
                  ? "Actualizando..."
                  : "Actualizar"}
              </button>
            </div>

            {/* SIN PEDIDOS */}

            {!error && pedidos.length === 0 && (
              <div className="nalu-orders-empty">
                <div className="nalu-orders-empty-icon">
                  <ShoppingBag size={45} />
                </div>

                <h2>Aún no tienes pedidos</h2>

                <p>
                  Descubre nuestras colecciones
                  y elige la próxima joya que
                  contará tu historia.
                </p>

                <Link
                  to="/catalogo"
                  className="btn btn-primary"
                >
                  Explorar joyas
                  <ArrowRight size={17} />
                </Link>
              </div>
            )}

            {/* LISTADO REAL */}

            <div className="nalu-orders-list">
              {pedidos.map((pedido) => (
                <TarjetaPedido
                  key={pedido.id}
                  pedido={pedido}
                />
              ))}
            </div>

            {/* VOLVER AL CATÁLOGO */}

            {pedidos.length > 0 && (
              <div className="nalu-orders-footer">
                <Sparkles size={22} />

                <h3>Siempre hay una joya para ti</h3>

                <p>
                  Sigue explorando nuestras colecciones.
                </p>

                <Link
                  to="/catalogo"
                  className="btn btn-primary"
                >
                  Seguir comprando
                  <ArrowRight size={17} />
                </Link>
              </div>
            )}
          </>
        )}
      </div>
    </main>
  );
}
