
import { Gem, Mail, ShieldCheck, Heart } from "lucide-react";
import { Link } from "react-router-dom";

export default function Footer() {
  return (
    <footer className="site-footer">
      <div className="container footer-grid">

        {/* INFORMACIÓN DE NALU LUXE */}
        <div className="footer-about">
          <h2>
            <Gem size={23} />
            NALÚ LUXE
          </h2>

          <p>
            Joyas que resaltan tu esencia.
            Una colección creada para acompañar
            tus momentos especiales.
          </p>
        </div>

        {/* NAVEGACIÓN */}
        <div>
          <h3>Explora</h3>

          <Link to="/">Inicio</Link>

          <Link to="/catalogo">
            Todas las joyas
          </Link>

          <Link to="/carrito">
            Mi carrito
          </Link>
        </div>

        {/* CATEGORÍAS */}
        <div>
          <h3>Colecciones</h3>

          <Link to="/catalogo?categoria=Anillos">
            Anillos
          </Link>

          <Link to="/catalogo?categoria=Aretes">
            Aretes
          </Link>

          <Link to="/catalogo?categoria=Collares">
            Collares
          </Link>

          <Link to="/catalogo?categoria=Pulseras">
            Pulseras
          </Link>
        </div>

        {/* INFORMACIÓN DE CONTACTO */}
        <div>
          <h3>Tu confianza importa</h3>

          <p>
            <ShieldCheck size={17} />
            Protección de tus datos
          </p>

          <p>
            <Mail size={17} />
            Atención personalizada
          </p>

          <p>
            <Heart size={17} />
            Hecho con amor para ti
          </p>
        </div>

      </div>

      <div className="footer-bottom">
        © {new Date().getFullYear()} Nalú Luxe.
        Laura Tatiana Gaona Castaño.
      </div>
    </footer>
  );
}
