
import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";

import {
  ArrowLeft,
  ArrowRight,
  BadgeCheck,
  Check,
  CheckCircle2,
  ChevronRight,
  Gem,
  Gift,
  Heart,
  LockKeyhole,
  MapPin,
  Package,
  PackageCheck,
  Plus,
  ReceiptText,
  ShieldCheck,
  ShoppingBag,
  Sparkles,
  Truck,
} from "lucide-react";

import { useAuth } from "../context/AuthContext";
import { direccionService } from "../services/direccionService";
import { pedidoService } from "../services/pedidoService";

import "../finalizarCompra.css";

const formatoPrecio = (valor) =>
  new Intl.NumberFormat("es-CO", {
    style: "currency",
    currency: "COP",
    maximumFractionDigits: 0,
  }).format(Number(valor || 0));

function fechaLegible(fecha) {
  if (!fecha) return "";

  const [parteFecha, parteHora] = fecha.split("T");

  if (!parteFecha) return "";

  const [anio, mes, dia] = parteFecha.split("-");

  return `${dia}/${mes}/${anio}${
    parteHora ? ` · ${parteHora.slice(0, 5)}` : ""
  }`;
}

function textoDireccion(direccion) {
  return [
    direccion.direccion,
    direccion.barrio,
    direccion.localidad,
    direccion.ciudad,
  ]
    .filter(Boolean)
    .join(", ");
}

function FotografiaJoya({ item }) {
  const [fallo, setFallo] = useState(false);

  if (!item.imagenPrincipal || fallo) {
    return (
      <div className="nl-checkout-photo nl-checkout-photo-empty">
        <Gem size={30} strokeWidth={1.3} />
      </div>
    );
  }

  return (
    <div className="nl-checkout-photo">
      <img
        src={item.imagenPrincipal}
        alt={item.nombre}
        loading="lazy"
        onError={() => setFallo(true)}
      />
    </div>
  );
}

function CabeceraCheckout({ paso = 1 }) {
  return (
    <>
      <div className="nl-checkout-hero">
        <div className="nl-checkout-hero-decoration">
          <Sparkles size={22} />
        </div>

        <div className="nl-checkout-hero-content">
          <span className="nl-checkout-kicker">
            <Gem size={15} />
            NALÚ LUXE · THE SIGNATURE EXPERIENCE
          </span>

          <h1>
            El último detalle
            <em> antes de brillar.</em>
          </h1>

          <p>
            Tus joyas favoritas están a un paso de
            convertirse en parte de tu historia.
          </p>
        </div>

        <div className="nl-checkout-hero-decoration">
          <Sparkles size={22} />
        </div>
      </div>

      <div className="nl-checkout-steps">
        <div className="nl-checkout-step complete">
          <span className="nl-checkout-step-number">
            <Check size={16} />
          </span>
          <span>Tu selección</span>
        </div>

        <div className="nl-checkout-step-line" />

        <div className={`nl-checkout-step ${
          paso >= 1 ? "active" : ""
        }`}>
          <span className="nl-checkout-step-number">
            {paso > 1 ? <Check size={16} /> : "2"}
          </span>
          <span>Confirmar pedido</span>
        </div>

        <div className="nl-checkout-step-line" />

        <div className={`nl-checkout-step ${
          paso === 2 ? "active" : ""
        }`}>
          <span className="nl-checkout-step-number">
            {paso === 2 ? <Check size={16} /> : "3"}
          </span>
          <span>Confirmación</span>
        </div>
      </div>
    </>
  );
}

function ConfirmacionPedido({ pedido }) {
  const navigate = useNavigate();

  return (
    <div className="nl-checkout-success">
      <div className="nl-checkout-success-sparkle">
        <Sparkles size={26} />
      </div>

      <div className="nl-checkout-success-symbol">
        <CheckCircle2 size={54} strokeWidth={1.35} />
      </div>

      <span className="nl-checkout-success-kicker">
        NALÚ LUXE · UN NUEVO CAPÍTULO
      </span>

      <h2>
        ¡Tu pedido ya es
        <em> parte de nuestra historia!</em>
      </h2>

      <p className="nl-checkout-success-intro">
        Tu selección de joyas ha quedado registrada
        correctamente. Gracias por elegir NALÚ LUXE
        para acompañar tus momentos especiales.
      </p>

      <div className="nl-checkout-success-ticket">
        <div className="nl-checkout-ticket-heading">
          <div>
            <span>CONFIRMACIÓN DE PEDIDO</span>
            <strong>NALÚ LUXE</strong>
          </div>
          <Gem size={29} strokeWidth={1.2} />
        </div>

        <div className="nl-checkout-ticket-number">
          <span>Número de pedido</span>
          <strong>{pedido.numero}</strong>
        </div>

        <div className="nl-checkout-ticket-grid">
          <div>
            <span>Estado actual</span>
            <strong className="nl-checkout-status">
              <CheckCircle2 size={15} />
              {pedido.estado}
            </strong>
          </div>

          <div>
            <span>Fecha de registro</span>
            <strong>{fechaLegible(pedido.fecha)}</strong>
          </div>
        </div>

        <div className="nl-checkout-ticket-products">
          <span className="nl-checkout-ticket-section-title">
            TUS JOYAS
          </span>

          {(pedido.productos || []).map((producto, i) => (
            <div
              key={`${producto.productoId}-${i}`}
              className="nl-checkout-ticket-product"
            >
              <span>
                {producto.nombreProducto}
                {" × "}{producto.cantidad}
              </span>

              <strong>
                {formatoPrecio(producto.subtotal)}
              </strong>
            </div>
          ))}
        </div>

        <div className="nl-checkout-ticket-total">
          <span>Total registrado</span>
          <strong>{formatoPrecio(pedido.total)}</strong>
        </div>
      </div>

      <div className="nl-checkout-success-notice">
        <ShieldCheck size={18} />
        <span>
          Tu pedido quedó guardado en el sistema.
          Todavía no se ha realizado ningún cobro.
        </span>
      </div>

      <div className="nl-checkout-success-actions">
        <button
          type="button"
          className="nl-checkout-primary-button"
          onClick={() => navigate("/mis-pedidos")}
        >
          Seguir mi pedido
          <ArrowRight size={18} />
        </button>

        <Link
          to="/catalogo"
          className="nl-checkout-secondary-button"
        >
          Descubrir más joyas
        </Link>
      </div>

      <div className="nl-checkout-success-footer">
        <Heart size={16} />
        Hecho con amor para quienes brillan a su manera.
      </div>
    </div>
  );
}

export default function FinalizarCompra({
  carrito = [],
  vaciarCarrito,
}) {
  const { token } = useAuth();

  const [direcciones, setDirecciones] = useState([]);
  const [direccionId, setDireccionId] = useState("");
  const [observaciones, setObservaciones] = useState("");

  const [cargando, setCargando] = useState(true);
  const [enviando, setEnviando] = useState(false);
  const [error, setError] = useState("");
  const [pedidoCreado, setPedidoCreado] = useState(null);

  useEffect(() => {
    let activo = true;

    async function cargarDirecciones() {
      setCargando(true);

      try {
        const datos = await direccionService.listar(token);

        if (!activo) return;

        const lista = Array.isArray(datos) ? datos : [];
        const principal =
          lista.find((d) => d.principal) || lista[0];

        setDirecciones(lista);
        setDireccionId(
          principal ? String(principal.id) : ""
        );
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
      cargarDirecciones();
    }

    return () => {
      activo = false;
    };
  }, [token]);

  const subtotal = useMemo(
    () =>
      carrito.reduce(
        (suma, item) =>
          suma +
          Number(item.precio || 0) *
            Number(item.cantidad || 0),
        0
      ),
    [carrito]
  );

  const unidades = useMemo(
    () =>
      carrito.reduce(
        (suma, item) =>
          suma + Number(item.cantidad || 0),
        0
      ),
    [carrito]
  );

  const direccionSeleccionada = direcciones.find(
    (d) => String(d.id) === direccionId
  );

  async function confirmarPedido(evento) {
    evento.preventDefault();

    if (enviando || pedidoCreado) return;

    if (!direccionId || carrito.length === 0) {
      setError(
        "Necesitas al menos una joya y una dirección de entrega."
      );
      return;
    }

    setError("");
    setEnviando(true);

    try {
      // Respetamos exactamente el DTO del backend:
      // direccionId, productos y observaciones.
      const datos = {
        direccionId: Number(direccionId),
        productos: carrito.map((item) => ({
          productoId: Number(item.id),
          cantidad: Number(item.cantidad),
        })),
        observaciones: observaciones.trim(),
      };

      const pedido = await pedidoService.crear(
        token,
        datos
      );

      // Primero guardamos la confirmación;
      // después vaciamos el carrito.
      setPedidoCreado(pedido);

      if (typeof vaciarCarrito === "function") {
        vaciarCarrito();
      }
    } catch (err) {
      setError(
        err.message ||
        "No se pudo registrar el pedido."
      );
    } finally {
      setEnviando(false);
    }
  }

  return (
    <main className="nl-checkout-page">
      <div className="container nl-checkout-container">
        {!pedidoCreado && (
          <Link
            to="/carrito"
            className="nl-checkout-back"
          >
            <ArrowLeft size={17} />
            Volver a mi carrito
          </Link>
        )}

        <CabeceraCheckout paso={pedidoCreado ? 2 : 1} />

        {pedidoCreado ? (
          <ConfirmacionPedido pedido={pedidoCreado} />
        ) : carrito.length === 0 ? (
          <div className="nl-checkout-empty">
            <ShoppingBag size={48} />

            <h2>Tu historia comienza con una joya</h2>

            <p>
              Tu carrito está vacío. Descubre las
              colecciones de NALÚ LUXE.
            </p>

            <Link
              to="/catalogo"
              className="nl-checkout-primary-button"
            >
              Explorar el catálogo
              <ArrowRight size={18} />
            </Link>
          </div>
        ) : (
          <>
            {error && (
              <div
                className="auth-alert auth-alert-error"
                role="alert"
              >
                {error}
              </div>
            )}

            <div className="nl-checkout-layout">
              <div className="nl-checkout-main">
                {/* SECCIÓN DE JOYAS */}

                <section className="nl-checkout-card">
                  <div className="nl-checkout-section-heading">
                    <div className="nl-checkout-section-icon">
                      <ShoppingBag size={22} />
                    </div>

                    <div>
                      <span>01 · TU SELECCIÓN</span>
                      <h2>Las joyas que elegiste</h2>
                      <p>
                        Cada detalle cuenta. Revisa
                        tus piezas favoritas.
                      </p>
                    </div>
                  </div>

                  <div className="nl-checkout-items">
                    {carrito.map((item) => (
                      <div
                        className="nl-checkout-item"
                        key={item.id}
                      >
                        <FotografiaJoya item={item} />

                        <div className="nl-checkout-item-info">
                          <span className="nl-checkout-item-label">
                            NALÚ LUXE COLLECTION
                          </span>

                          <h3>{item.nombre}</h3>

                          <p>
                            {item.cantidad}
                            {" "}
                            {Number(item.cantidad) === 1
                              ? "unidad"
                              : "unidades"}
                            {" · "}
                            {formatoPrecio(item.precio)}
                            {" c/u"}
                          </p>
                        </div>

                        <strong className="nl-checkout-item-price">
                          {formatoPrecio(
                            Number(item.precio) *
                            Number(item.cantidad)
                          )}
                        </strong>
                      </div>
                    ))}
                  </div>

                  <div className="nl-checkout-card-footnote">
                    <ShieldCheck size={16} />
                    Precios y existencias verificados
                    nuevamente al registrar el pedido.
                  </div>
                </section>

                {/* DIRECCIÓN Y OBSERVACIONES */}

                <form
                  id="nl-form-compra"
                  className="nl-checkout-card"
                  onSubmit={confirmarPedido}
                >
                  <div className="nl-checkout-section-heading">
                    <div className="nl-checkout-section-icon">
                      <MapPin size={22} />
                    </div>

                    <div>
                      <span>02 · ENTREGA</span>
                      <h2>Un destino especial</h2>
                      <p>
                        ¿Dónde deseas recibir tus joyas?
                      </p>
                    </div>
                  </div>

                  {cargando ? (
                    <p>Cargando tus direcciones...</p>
                  ) : direcciones.length === 0 ? (
                    <div className="nl-checkout-no-address">
                      <MapPin size={25} />

                      <p>
                        Todavía no tienes una dirección
                        registrada.
                      </p>

                      <Link
                        to="/mis-direcciones"
                        className="nl-checkout-secondary-button"
                      >
                        <Plus size={17} />
                        Agregar dirección
                      </Link>
                    </div>
                  ) : (
                    <>
                      <label
                        className="nl-checkout-label"
                        htmlFor="nl-direccion"
                      >
                        Dirección seleccionada
                      </label>

                      <select
                        id="nl-direccion"
                        className="nl-checkout-field"
                        value={direccionId}
                        onChange={(e) =>
                          setDireccionId(e.target.value)
                        }
                        required
                      >
                        {direcciones.map((direccion) => (
                          <option
                            value={direccion.id}
                            key={direccion.id}
                          >
                            {direccion.etiqueta}
                            {" · "}
                            {direccion.direccion}
                            {", "}
                            {direccion.ciudad}
                          </option>
                        ))}
                      </select>

                      {direccionSeleccionada && (
                        <div className="nl-checkout-address-preview">
                          <MapPin size={21} />

                          <div>
                            <strong>
                              {direccionSeleccionada.etiqueta}
                            </strong>

                            <span>
                              {textoDireccion(
                                direccionSeleccionada
                              )}
                            </span>

                            {direccionSeleccionada.principal && (
                              <small>
                                <CheckCircle2 size={13} />
                                Dirección principal
                              </small>
                            )}
                          </div>
                        </div>
                      )}

                      <Link
                        to="/mis-direcciones"
                        className="nl-checkout-edit-address"
                      >
                        Administrar mis direcciones
                        <ChevronRight size={15} />
                      </Link>
                    </>
                  )}

                  <label
                    className="nl-checkout-label"
                    htmlFor="nl-observaciones"
                  >
                    Indicaciones adicionales
                    <span> (opcional)</span>
                  </label>

                  <textarea
                    id="nl-observaciones"
                    className="nl-checkout-field nl-checkout-textarea"
                    rows={4}
                    maxLength={500}
                    placeholder="Por ejemplo: entregar en portería o llamar antes de llegar."
                    value={observaciones}
                    onChange={(e) =>
                      setObservaciones(e.target.value)
                    }
                  />
                </form>

                <div className="nl-checkout-promise">
                  <Gift size={21} />
                  <p>
                    <strong>Los detalles hacen la diferencia.</strong>
                    {" "}
                    Gracias por elegir NALÚ LUXE.
                  </p>
                  <Heart size={18} />
                </div>
              </div>

              {/* RESUMEN LATERAL */}

              <aside className="nl-checkout-sidebar">
                <div className="nl-checkout-summary">
                  <div className="nl-checkout-summary-top">
                    <Gem size={26} strokeWidth={1.3} />

                    <span>EL DETALLE FINAL</span>

                    <h2>Resumen de tu pedido</h2>

                    <p>
                      Una selección tan única como tú.
                    </p>
                  </div>

                  <div className="nl-checkout-summary-body">
                    <div className="nl-checkout-summary-row">
                      <span>Joyas seleccionadas</span>
                      <strong>{unidades}</strong>
                    </div>

                    <div className="nl-checkout-summary-row">
                      <span>Subtotal</span>
                      <strong>
                        {formatoPrecio(subtotal)}
                      </strong>
                    </div>

                    <div className="nl-checkout-summary-row">
                      <span>Envío del prototipo</span>
                      <strong>{formatoPrecio(0)}</strong>
                    </div>

                    <div className="nl-checkout-summary-total">
                      <span>Total a registrar</span>

                      <strong>
                        {formatoPrecio(subtotal)}
                      </strong>
                    </div>

                    <p className="nl-checkout-summary-disclaimer">
                      El servidor recalculará el total.
                      Esta versión registra el pedido,
                      pero no procesa pagos.
                    </p>

                    <button
                      type="submit"
                      form="nl-form-compra"
                      className="nl-checkout-primary-button nl-checkout-confirm"
                      disabled={
                        enviando ||
                        cargando ||
                        direcciones.length === 0
                      }
                    >
                      {enviando
                        ? "Registrando tu pedido..."
                        : "Confirmar mi pedido"}

                      {!enviando && <ArrowRight size={19} />}
                    </button>

                    <div className="nl-checkout-secure">
                      <LockKeyhole size={15} />

                      <span>
                        Registro protegido mediante
                        tu sesión autenticada.
                      </span>
                    </div>
                  </div>
                </div>

                <div className="nl-checkout-side-note">
                  <Sparkles size={19} />

                  <span>
                    Algunas joyas se eligen con los ojos.
                    Las especiales, con el corazón.
                  </span>
                </div>
              </aside>
            </div>
          </>
        )}
      </div>
    </main>
  );
}
