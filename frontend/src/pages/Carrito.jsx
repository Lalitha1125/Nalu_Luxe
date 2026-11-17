
import { Link } from "react-router-dom";

import {
  ArrowLeft,
  ArrowRight,
  Minus,
  Plus,
  ShoppingBag,
  Trash2,
  ShieldCheck,
} from "lucide-react";

import {
  ImagenProducto,
  formatoPrecio,
} from "../components/ProductCard";

import { useAuth } from "../context/AuthContext";

export default function Carrito({
  carrito,
  actualizarCantidad,
  quitarProducto,
  productos,
}) {
  const { autenticado, verificandoSesion } = useAuth();

  // ==========================================
  // CALCULAR TOTAL DEL CARRITO
  // ==========================================

  const total = carrito.reduce(
    (suma, item) =>
      suma +
      Number(item.precio) * Number(item.cantidad),
    0
  );

  // ==========================================
  // CALCULAR UNIDADES
  // ==========================================

  const unidades = carrito.reduce(
    (suma, item) =>
      suma + Number(item.cantidad),
    0
  );

  // ==========================================
  // COMPROBAR DISPONIBILIDAD
  // ==========================================

  const hayProblemasStock = carrito.some((item) => {
    const productoActual = productos.find(
      (producto) => producto.id === item.id
    );

    if (!productoActual) {
      return true;
    }

    const stock = Number(productoActual.stock ?? 0);

    return item.cantidad > stock;
  });

  // ==========================================
  // AUMENTAR CANTIDAD
  // ==========================================

  function aumentar(item) {
    const productoActual = productos.find(
      (producto) => producto.id === item.id
    );

    const stock = Number(
      productoActual?.stock ?? 0
    );

    if (item.cantidad >= stock) {
      return;
    }

    actualizarCantidad(
      item.id,
      item.cantidad + 1
    );
  }

  // ==========================================
  // RUTA PARA CONFIRMAR PEDIDO
  // ==========================================

  const rutaContinuar =
    autenticado
      ? "/finalizar-compra"
      : "/login";

  return (
    <main className="container cart-page">
      <div className="page-heading">
        <span className="eyebrow">
          TU SELECCIÓN
        </span>

        <h1>Mi carrito</h1>

        <p>
          Revisa tus joyas favoritas antes
          de continuar con tu pedido.
        </p>
      </div>

      {carrito.length === 0 ? (
        // ====================================
        // CARRITO VACÍO
        // ====================================

        <div className="empty-state">
          <ShoppingBag size={54} />

          <h2>Tu carrito está vacío</h2>

          <p>
            Descubre las joyas de NALÚ LUXE
            y encuentra tus favoritas.
          </p>

          <Link
            to="/catalogo"
            className="btn btn-primary"
          >
            Explorar joyas
          </Link>
        </div>
      ) : (
        <div className="cart-layout">
          {/* ================================ */}
          {/* PRODUCTOS DEL CARRITO */}
          {/* ================================ */}

          <section className="cart-items">
            {carrito.map((item) => {
              const productoActual = productos.find(
                (producto) => producto.id === item.id
              );

              const stock = Number(
                productoActual?.stock ?? 0
              );

              const sinStock =
                item.cantidad > stock;

              return (
                <article
                  className="cart-item"
                  key={item.id}
                >
                  {/* FOTO DE LA JOYA */}

                  <div className="cart-item-image">
                    <ImagenProducto
                      producto={{
                        ...item,
                        imagenPrincipal:
                          item.imagenPrincipal,
                      }}
                    />
                  </div>

                  {/* INFORMACIÓN DEL PRODUCTO */}

                  <div className="cart-item-info">
                    <h3>{item.nombre}</h3>

                    <span>
                      {formatoPrecio(item.precio)}
                      {" "}por unidad
                    </span>

                    {/* CANTIDAD */}

                    <div className="quantity-selector">
                      <button
                        type="button"
                        onClick={() =>
                          actualizarCantidad(
                            item.id,
                            item.cantidad - 1
                          )
                        }
                        aria-label="Disminuir cantidad"
                      >
                        <Minus size={15} />
                      </button>

                      <span>
                        {item.cantidad}
                      </span>

                      <button
                        type="button"
                        disabled={
                          item.cantidad >= stock
                        }
                        onClick={() =>
                          aumentar(item)
                        }
                        aria-label="Aumentar cantidad"
                      >
                        <Plus size={15} />
                      </button>
                    </div>

                    {/* ALERTA DE INVENTARIO */}

                    {sinStock && (
                      <small className="error-text">
                        Disponibilidad actual:
                        {" "}{stock} unidades.
                        Ajusta la cantidad antes
                        de confirmar el pedido.
                      </small>
                    )}
                  </div>

                  {/* PRECIO Y ELIMINAR */}

                  <div className="cart-item-end">
                    <strong>
                      {formatoPrecio(
                        Number(item.precio) *
                        Number(item.cantidad)
                      )}
                    </strong>

                    <button
                      type="button"
                      onClick={() =>
                        quitarProducto(item.id)
                      }
                      aria-label="Eliminar producto"
                      title="Eliminar producto"
                    >
                      <Trash2 size={19} />
                    </button>
                  </div>
                </article>
              );
            })}

            <Link
              to="/catalogo"
              className="back-link"
            >
              <ArrowLeft size={17} />

              Seguir comprando
            </Link>
          </section>

          {/* ================================ */}
          {/* RESUMEN DE COMPRA */}
          {/* ================================ */}

          <aside className="cart-summary">
            <h2>Resumen de compra</h2>

            <div className="summary-row">
              <span>Productos</span>

              <strong>{unidades}</strong>
            </div>

            <div className="summary-row">
              <span>Subtotal</span>

              <strong>
                {formatoPrecio(total)}
              </strong>
            </div>

            <div className="summary-row">
              <span>Envío</span>

              <span>
                Se confirma al registrar el pedido
              </span>
            </div>

            <div className="summary-total">
              <span>Subtotal del carrito</span>

              <strong>
                {formatoPrecio(total)}
              </strong>
            </div>

            {/* ESTADO DE LA SESIÓN */}

            {!verificandoSesion && !autenticado && (
              <p className="cart-auth-notice">
                <ShieldCheck size={17} />

                Necesitas iniciar sesión
                para registrar tu pedido.
              </p>
            )}

            {/* PROBLEMAS DE STOCK */}

            {hayProblemasStock && (
              <p className="cart-stock-notice">
                Algunos productos tienen
                existencias insuficientes.
                Ajusta las cantidades antes
                de continuar.
              </p>
            )}

            {/* BOTÓN REAL DE COMPRA */}

            {hayProblemasStock || verificandoSesion ? (
              <button
                type="button"
                className="btn btn-primary btn-block"
                disabled
              >
                {verificandoSesion
                  ? "Comprobando sesión..."
                  : "Ajusta tu carrito"}
              </button>
            ) : (
              <Link
                to={rutaContinuar}
                className="btn btn-primary btn-block"
              >
                {autenticado
                  ? "Finalizar pedido"
                  : "Iniciar sesión para continuar"}

                <ArrowRight size={18} />
              </Link>
            )}

            <p className="muted-text">
              Los precios y el inventario
              se comprobarán nuevamente
              al registrar el pedido.
              El registro no representa
              un pago realizado.
            </p>
          </aside>
        </div>
      )}
    </main>
  );
}
