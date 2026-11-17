
import { useState } from "react";
import { Link } from "react-router-dom";

import {
  ShieldCheck,
  Mail,
  Copy,
  KeyRound,
  UserRoundPlus,
  ArrowLeft,
} from "lucide-react";

import { useAuth } from "../context/AuthContext";
import { invitacionAdminService } from "../services/invitacionAdminService";

export default function InvitacionesAdmin() {
  const {
    usuario,
    token,
    esAdmin,
    cerrarSesion,
  } = useAuth();

  const [correo, setCorreo] = useState("");
  const [codigo, setCodigo] = useState("");

  const [invitacion, setInvitacion] = useState(null);
  const [cargando, setCargando] = useState(false);

  const [error, setError] = useState("");
  const [mensaje, setMensaje] = useState("");
  const [activada, setActivada] = useState(false);

  async function crear(evento) {
    evento.preventDefault();

    setError("");
    setMensaje("");
    setInvitacion(null);
    setCargando(true);

    try {
      const respuesta =
        await invitacionAdminService.crear(
          token,
          correo.trim().toLowerCase()
        );

      setInvitacion(respuesta);
      setMensaje(respuesta.mensaje);
      setCorreo("");
    } catch (err) {
      setError(err.message);
    } finally {
      setCargando(false);
    }
  }

  async function aceptar(evento) {
    evento.preventDefault();

    setError("");
    setMensaje("");
    setCargando(true);

    try {
      const respuesta =
        await invitacionAdminService.aceptar(
          token,
          codigo.trim()
        );

      setActivada(true);
      setMensaje(respuesta.mensaje);
      setCodigo("");

      // El backend ya revocó las sesiones
      // antiguas. Limpiamos también la local.
      try {
        await cerrarSesion();
      } catch {
        // La sesión anterior ya fue invalidada.
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setCargando(false);
    }
  }

  async function copiarToken() {
    if (!invitacion?.token) return;

    try {
      await navigator.clipboard.writeText(
        invitacion.token
      );

      setMensaje(
        "Token copiado. Compártelo solo con la persona invitada."
      );
    } catch {
      setError(
        "No fue posible copiar automáticamente. Selecciona el token y cópialo."
      );
    }
  }

  return (
    <main className="admin-page">
      <div className="container">
        <Link
          to={esAdmin ? "/admin" : "/mi-cuenta"}
          className="back-link"
        >
          <ArrowLeft size={17} />
          Volver
        </Link>

        <div className="admin-heading">
          <div>
            <span className="eyebrow">
              NALÚ LUXE · SEGURIDAD
            </span>

            <h1>Invitaciones administrativas</h1>

            <p>
              Administración segura de accesos
              para el equipo de NALÚ LUXE.
            </p>
          </div>

          <ShieldCheck
            size={42}
            color="#b99561"
          />
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
            {mensaje}
          </div>
        )}

        {esAdmin ? (
          <section className="admin-card">
            <div className="admin-section-heading">
              <div>
                <h2>
                  <UserRoundPlus size={22} />
                  Invitar a un administrador
                </h2>

                <p>
                  La persona debe tener una cuenta
                  CLIENTE activa y verificada.
                </p>
              </div>
            </div>

            <form
              className="auth-form"
              onSubmit={crear}
            >
              <label htmlFor="invitacion-correo">
                Correo de la persona invitada
              </label>

              <div className="auth-input">
                <Mail size={19} />

                <input
                  id="invitacion-correo"
                  type="email"
                  required
                  maxLength={150}
                  placeholder="correo@ejemplo.com"
                  value={correo}
                  onChange={(e) =>
                    setCorreo(e.target.value)
                  }
                />
              </div>

              <button
                type="submit"
                className="btn btn-primary"
                disabled={cargando}
              >
                {cargando
                  ? "Generando..."
                  : "Crear invitación"}
              </button>
            </form>

            {invitacion && (
              <div className="nalu-invitation-result">
                <h3>Invitación creada</h3>

                <p>
                  Destinatario:
                  {" "}<strong>{invitacion.correo}</strong>
                </p>

                <p>
                  Vence:
                  {" "}{invitacion.venceEn?.replace("T", " ")}
                  {" "}UTC
                </p>

                <label htmlFor="token-generado">
                  Token de invitación
                </label>

                <textarea
                  id="token-generado"
                  readOnly
                  rows={3}
                  value={invitacion.token}
                  onFocus={(e) => e.target.select()}
                />

                <button
                  type="button"
                  className="btn btn-outline"
                  onClick={copiarToken}
                >
                  <Copy size={17} />
                  Copiar token
                </button>

                <p className="admin-muted">
                  Este token se muestra una sola vez.
                  No lo compartas públicamente.
                  La persona invitada deberá entrar
                  con su propia cuenta en la página
                  de activación.
                </p>
              </div>
            )}
          </section>
        ) : activada ? (
          <section className="admin-card">
            <ShieldCheck
              size={44}
              color="#477a61"
            />

            <h2>¡Cuenta administrativa activada!</h2>

            <p>
              Tu sesión anterior fue cerrada.
              Inicia sesión otra vez y verifica
              el OTP para utilizar el panel ADMIN.
            </p>

            <Link
              to="/login"
              className="btn btn-primary"
            >
              Iniciar sesión
            </Link>
          </section>
        ) : (
          <section className="admin-card">
            <h2>Activar mi invitación</h2>

            <p>
              Cuenta actual:
              {" "}<strong>{usuario?.correo}</strong>
            </p>

            <p className="admin-muted">
              Solo puedes aceptar invitaciones
              enviadas a tu correo verificado.
            </p>

            <form
              className="auth-form"
              onSubmit={aceptar}
            >
              <label htmlFor="codigo-invitacion">
                Token de invitación
              </label>

              <div className="auth-input">
                <KeyRound size={19} />

                <input
                  id="codigo-invitacion"
                  type="text"
                  required
                  autoComplete="off"
                  placeholder="Pega tu token aquí"
                  value={codigo}
                  onChange={(e) =>
                    setCodigo(e.target.value)
                  }
                />
              </div>

              <button
                type="submit"
                className="btn btn-primary"
                disabled={cargando}
              >
                {cargando
                  ? "Verificando invitación..."
                  : "Aceptar invitación"}
              </button>
            </form>
          </section>
        )}
      </div>
    </main>
  );
}
