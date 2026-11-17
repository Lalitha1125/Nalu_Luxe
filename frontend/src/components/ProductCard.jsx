
import { useState } from "react";
import { Link } from "react-router-dom";
import { ShoppingBag, ArrowUpRight } from "lucide-react";

export function formatoPrecio(valor) {
  return new Intl.NumberFormat("es-CO", {
    style: "currency",
    currency: "COP",
    maximumFractionDigits: 0,
  }).format(Number(valor || 0));
}

export function ImagenProducto({ producto, className = "" }) {
  const [imagenFallida, setImagenFallida] = useState(false);

  const imagen = producto?.imagenPrincipal;
  const categoria = producto?.categoria?.nombre || "Joyería";

  const simbolos = {
    Anillos: "💍",
    Aretes: "✨",
    Collares: "📿",
    Pulseras: "💎",
  };

  if (!imagen || imagenFallida) {
    return (
      <div className={`image-placeholder ${className}`}>
        <span className="placeholder-symbol">
          {simbolos[categoria] || "💎"}
        </span>
        <span>NALÚ LUXE</span>
        <small>{categoria}</small>
      </div>
    );
  }

  return (
    <img
      className={className}
      src={imagen}
      alt={producto.nombre}
      loading="lazy"
      onError={() => setImagenFallida(true)}
    />
  );
}

export default function ProductCard({ producto, agregarAlCarrito }) {
  const agotado = Number(producto.stock) <= 0;

  return (
    <article className="product-card">
      <Link
        to={`/producto/${producto.id}`}
        className="product-card-image"
      >
        <ImagenProducto
          key={producto.id}
          producto={producto}
        />

        {producto.destacado && (
          <span className="product-badge">Destacado</span>
        )}
      </Link>

      <div className="product-card-content">
        <span className="product-category">
          {producto.categoria?.nombre || "Joyería"}
        </span>

        <Link to={`/producto/${producto.id}`}>
          <h3>{producto.nombre}</h3>
        </Link>

        <p className="product-price">
          {formatoPrecio(producto.precio)}
        </p>

        <div className="product-card-actions">
          <Link
            to={`/producto/${producto.id}`}
            className="btn btn-outline btn-small"
          >
            Ver detalle <ArrowUpRight size={15} />
          </Link>

          <button
            type="button"
            className="btn btn-primary btn-small"
            disabled={agotado}
            onClick={() => agregarAlCarrito(producto, 1)}
          >
            <ShoppingBag size={15} />
            {agotado ? "Agotado" : "Agregar"}
          </button>
        </div>
      </div>
    </article>
  );
}
