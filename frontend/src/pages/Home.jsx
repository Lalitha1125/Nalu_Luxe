
import { Link } from "react-router-dom";
import {
  ArrowRight,
  Gem,
  Heart,
  Sparkles,
  Truck,
  ShieldCheck,
} from "lucide-react";

import ProductCard from "../components/ProductCard";

const colecciones = [
  {
    nombre: "Anillos",
    descripcion: "Pequeños detalles, grandes emociones.",
    simbolo: "💍",
  },
  {
    nombre: "Aretes",
    descripcion: "El brillo perfecto para tu estilo.",
    simbolo: "✨",
  },
  {
    nombre: "Collares",
    descripcion: "Elegancia cerca de tu corazón.",
    simbolo: "📿",
  },
  {
    nombre: "Pulseras",
    descripcion: "Un toque especial para cada día.",
    simbolo: "💎",
  },
];

export default function Home({
  productos,
  cargando,
  error,
  agregarAlCarrito,
}) {
  const destacados = productos.filter(
    (producto) => producto.destacado
  );

  const seleccion = destacados.length > 0
    ? destacados.slice(0, 8)
    : productos.slice(0, 8);

  return (
    <main>
      <section className="hero">
        <div className="container hero-grid">
          <div className="hero-content">
            <span className="eyebrow">
              ✦ DETALLES QUE ENAMORAN ✦
            </span>

            <h1>
              Joyas que resaltan
              <em> tu esencia.</em>
            </h1>

            <p>
              Descubre accesorios delicados y elegantes,
              diseñados para complementar tu estilo
              y acompañar tus momentos especiales.
            </p>

            <div className="hero-buttons">
              <Link to="/catalogo" className="btn btn-primary">
                Explorar colección
                <ArrowRight size={18} />
              </Link>

              <a
                className="btn btn-outline"
                href="#colecciones"
              >
                Nuestras categorías
              </a>
            </div>

            <div className="hero-caption">
              <Gem size={18} />
              ELEGANCIA · DELICADEZA · ESTILO
            </div>
          </div>

          <div className="hero-art">
            <div className="hero-art-inner">
              <Sparkles className="hero-sparkle top" />
              <span className="hero-diamond">💎</span>
              <span className="hero-art-name">NALÚ LUXE</span>
              <small>JEWELRY COLLECTION</small>
              <Sparkles className="hero-sparkle bottom" />
            </div>
            <span className="hero-art-note">
              Tu brillo, tu historia ✨
            </span>
          </div>
        </div>
      </section>

      <section className="benefits">
        <div className="container benefits-grid">
          <div>
            <Truck size={25} />
            <span>Entregas por coordinar</span>
          </div>
          <div>
            <ShieldCheck size={25} />
            <span>Acceso seguro en desarrollo</span>
          </div>
          <div>
            <Heart size={25} />
            <span>Detalles con significado</span>
          </div>
          <div>
            <Gem size={25} />
            <span>40 joyas para descubrir</span>
          </div>
        </div>
      </section>

      <section id="colecciones" className="container section">
        <div className="section-title">
          <span className="eyebrow">ENCUENTRA TU ESTILO</span>
          <h2>Nuestras colecciones</h2>
          <p>
            Cuatro categorías de joyas para descubrir
            el detalle ideal.
          </p>
        </div>

        <div className="collections-grid">
          {colecciones.map((coleccion) => (
            <Link
              key={coleccion.nombre}
              className="collection-card"
              to={`/catalogo?categoria=${encodeURIComponent(
                coleccion.nombre
              )}`}
            >
              <div className="collection-icon">
                {coleccion.simbolo}
              </div>

              <h3>{coleccion.nombre}</h3>
              <p>{coleccion.descripcion}</p>

              <span>
                Explorar <ArrowRight size={16} />
              </span>
            </Link>
          ))}
        </div>
      </section>

      <section className="section featured-section">
        <div className="container">
          <div className="section-title">
            <span className="eyebrow">
              SELECCIÓN ESPECIAL
            </span>
            <h2>Joyas para enamorarte</h2>
            <p>
              Descubre algunas de nuestras piezas favoritas.
            </p>
          </div>

          {cargando && (
            <p className="info-message">
              Cargando joyas desde MySQL...
            </p>
          )}

          {error && (
            <p className="error-message">{error}</p>
          )}

          {!cargando && !error && (
            <div className="products-grid">
              {seleccion.map((producto) => (
                <ProductCard
                  key={producto.id}
                  producto={producto}
                  agregarAlCarrito={agregarAlCarrito}
                />
              ))}
            </div>
          )}

          <div className="section-action">
            <Link to="/catalogo" className="btn btn-primary">
              Ver todas las joyas
              <ArrowRight size={17} />
            </Link>
          </div>
        </div>
      </section>

      <section className="brand-story">
        <div className="container brand-story-inner">
          <Gem size={42} strokeWidth={1.3} />
          <span className="eyebrow">NALÚ LUXE</span>

          <h2>Un detalle. Mil emociones.</h2>

          <p>
            Creemos que una joya puede expresar cariño,
            celebrar un logro y recordarte lo especial
            que eres. Cada detalle tiene una historia.
          </p>

          <Link to="/catalogo" className="btn btn-outline">
            Descubrir nuestra colección
          </Link>
        </div>
      </section>
    </main>
  );
}
