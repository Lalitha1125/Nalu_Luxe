
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

import {
  ArrowLeft,
  MessageSquare,
  RefreshCcw,
  CheckCircle2,
} from "lucide-react";

import { useAuth } from "../context/AuthContext";
import { consultaService } from "../services/consultaService";

const ESTADOS = [
  "PENDIENTE",
  "EN_PROCESO",
  "RESUELTA",
];

export default function AdminConsultas() {
  const { token } = useAuth();

  const [consultas, setConsultas] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [procesando, setProcesando] = useState(null);

  const [error, setError] = useState("");
  const [mensaje, setMensaje] = useState("");

  async function cargar() {
    setCargando(true);
    setError("");

    try {
      const datos = await consultaService.listar(token);
      setConsultas(datos);
    } catch (err) {
      setError(err.message);
    } finally {
      setCargando(false);
    }
  }

  useEffect(() => {
    let activo = true;

    async function cargarInicial() {
      try {
        const datos = await consultaService.listar(token);

        if (activo) setConsultas(datos);
      } catch (err) {
        if (activo) setError(err.message);
      } finally {
        if (activo) setCargando(false);
      }
    }

    cargarInicial();

    return () => {
      activo = false;
    };
  }, [token]);

  async function cambiarEstado(id, estado) {
    setError("");
    setMensaje("");
    setProcesando(id);

    try {
      await consultaService.cambiarEstado(
        token,
        id,
        estado
      );

      setConsultas((anterior) =>
        anterior.map((consulta) =>
          consulta.id === id
            ? { ...consulta, estado }
            : consulta
        )
      );

      setMensaje("Estado actualizado correctamente.");
    } catch (err) {
      setError(err.message);
    } finally {
      setProcesando(null);
    }
  }

  return (
    <main className="admin-page">
      <div className="container">
        <Link to="/admin" className="back-link">
          <ArrowLeft size={17} />
          Volver al panel
        </Link>

        <div className="admin-heading">
          <div>
            <span className="eyebrow">
              ADMINISTRACIÓN · NALÚ LUXE
            </span>

            <h1>Consultas de clientes</h1>

            <p>
              Revisa los mensajes enviados
              desde el formulario de contacto.
            </p>
          </div>

          <button
            type="button"
            className="btn btn-outline"
            onClick={cargar}
            disabled={cargando || procesando !== null}
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

        {cargando ? (
          <div className="admin-card">
            Cargando consultas...
          </div>
        ) : consultas.length === 0 ? (
          <div className="admin-card">
            <MessageSquare size={35} />

            <h2>No hay consultas registradas</h2>

            <p>
              Los mensajes del formulario
              aparecerán aquí.
            </p>
          </div>
        ) : (
          <div className="admin-orders">
            {consultas.map((consulta) => (
              <article
                key={consulta.id}
                className="admin-card"
              >
                <div className="admin-order-heading">
                  <div>
                    <span className="eyebrow">
                      CONSULTA #{consulta.id}
                    </span>

                    <h2>{consulta.asunto}</h2>

                    <p>
                      <strong>Cliente:</strong>{" "}
                      {consulta.nombre}
                    </p>

                    <p className="admin-muted">
                      Correo: {consulta.correo}
                    </p>
                  </div>

                  <span className="order-status">
                    {consulta.estado}
                  </span>
                </div>

                <p className="admin-muted">
                  Fecha:{" "}
                  {consulta.fecha?.replace("T", " ")}
                </p>

                <div className="contact-admin-message">
                  {consulta.mensaje}
                </div>

                <label
                  className="contact-admin-label"
                  htmlFor={`estado-consulta-${consulta.id}`}
                >
                  Estado de atención
                </label>

                <select
                  id={`estado-consulta-${consulta.id}`}
                  className="checkout-select"
                  value={consulta.estado}
                  onChange={(e) =>
                    cambiarEstado(
                      consulta.id,
                      e.target.value
                    )
                  }
                  disabled={procesando !== null}
                >
                  {ESTADOS.map((estado) => (
                    <option
                      key={estado}
                      value={estado}
                    >
                      {estado}
                    </option>
                  ))}
                </select>
              </article>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
