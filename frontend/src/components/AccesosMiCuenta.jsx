
import { Link } from "react-router-dom";

import {
  MapPin,
  PackageCheck,
  ArrowRight,
} from "lucide-react";

export default function AccesosMiCuenta() {
  return (
    <div className="nalu-account-access-grid">
      <section className="nalu-account-access-card">
        <div className="nalu-account-access-icon">
          <MapPin size={29} />
        </div>

        <h2>Mis direcciones</h2>

        <p>
          Guarda tus direcciones de entrega
          y selecciona la que utilizas habitualmente.
        </p>

        <Link
          to="/mis-direcciones"
          className="btn btn-primary"
        >
          Administrar direcciones
          <ArrowRight size={16} />
        </Link>
      </section>

      <section className="nalu-account-access-card">
        <div className="nalu-account-access-icon">
          <PackageCheck size={29} />
        </div>

        <h2>Mis pedidos</h2>

        <p>
          Consulta tus compras, los productos
          solicitados y el estado de cada pedido.
        </p>

        <Link
          to="/mis-pedidos"
          className="btn btn-primary"
        >
          Ver mis pedidos
          <ArrowRight size={16} />
        </Link>
      </section>
    </div>
  );
}
