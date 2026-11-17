
import { useState } from "react";
import { Link, useParams } from "react-router-dom";
import {
  ArrowLeft,
  Minus,
  Plus,
  ShoppingBag,
  ShieldCheck,
} from "lucide-react";

import {
  ImagenProducto,
  formatoPrecio,
} from "../components/ProductCard";

export default function ProductoDetalle({
  productos,
  cargando,
  agregarAlCarrito,
}) {
  const { id } = useParams();
  const [cantidad, setCantidad] = useState(1);

  const producto = productos.find(
    (item) => String(item.id) === String(id)
  );

  if (cargando) {
    return (
      <main className="container section">
        <p>Cargando información del producto...</p>
      </main>
    );
  }

  if (!producto) {
    return (
      <main className="container section empty-state">
        <h2>Producto no encontrado</h2>
        <Link to="/catalogo" className="btn btn-primary">
          Volver al catálogo
        </Link>
      </main>
    );
  }

  const stock = Number(producto.stock);
  const agotado = stock <= 0;
  const cantidadValida = Math.min(cantidad, Math.max(stock, 1));

  const agregar = () => {
    if (agotado) return;

    agregarAlCarrito(producto, cantidadValida);
  };

  return (
    <main className="container product-detail-page">
      <Link to="/catalogo" className="back-link">
        <ArrowLeft size={18} />
        Volver al catálogo
      </Link>

      <div className="product-detail-grid">
        <div className="product-detail-image">
          <ImagenProducto
            key={producto.id}
            producto={producto}
          />
        </div>

        <div className="product-detail-info">
          <span className="eyebrow">
            {producto.categoria?.nombre} · NALÚ LUXE
          </span>

          <h1>{producto.nombre}</h1>

          <div className="detail-price">
            {formatoPrecio(producto.precio)}
          </div>

          <p className="detail-description">
            {producto.descripcion}
          </p>

          <div className="product-specs">
            <div>
              <strong>Referencia</strong>
              <span>{producto.sku}</span>
            </div>

            <div>
              <strong>Material</strong>
              <span>{producto.material || "No especificado"}</span>
            </div>

            <div>
              <strong>Color</strong>
              <span>{producto.color || "No especificado"}</span>
            </div>

            <div>
              <strong>Disponibilidad</strong>
              <span className={agotado ? "out-stock" : "in-stock"}>
                {agotado
                  ? "Agotado"
                  : `${stock} unidades disponibles`}
              </span>
            </div>
          </div>

          <h3>Seleccionar cantidad</h3>

          <div className="quantity-selector">
            <button
              type="button"
              disabled={cantidadValida <= 1}
              onClick={() =>
                setCantidad(Math.max(1, cantidadValida - 1))
              }
              aria-label="Disminuir cantidad"
            >
              <Minus size={18} />
            </button>

            <span>{cantidadValida}</span>

            <button
              type="button"
              disabled={agotado || cantidadValida >= stock}
              onClick={() =>
                setCantidad(Math.min(stock, cantidadValida + 1))
              }
              aria-label="Aumentar cantidad"
            >
              <Plus size={18} />
            </button>
          </div>

          <button
            type="button"
            className="btn btn-primary detail-add"
            disabled={agotado}
            onClick={agregar}
          >
            <ShoppingBag size={19} />
            {agotado ? "Producto agotado" : "Agregar al carrito"}
          </button>

          <p className="security-note">
            <ShieldCheck size={17} />
            El pedido se confirmará cuando esté habilitado
            el módulo de compras.
          </p>
        </div>
      </div>
    </main>
  );
}
