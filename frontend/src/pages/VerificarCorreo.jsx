
import { useState } from "react";

import {
  Link,
  useLocation,
  useNavigate,
} from "react-router-dom";

import {
  MailCheck,
  ShieldCheck,
  ArrowRight,
  BadgeCheck,
  RefreshCcw,
} from "lucide-react";

import { authService } from "../services/authService";

export default function VerificarCorreo() {
  const navigate = useNavigate();
  const location = useLocation();

  const [correo, setCorreo] = useState(
    location.state?.correo ||
    sessionStorage.getItem("nalu_correo_pendiente") ||
    ""
  );

  const [codigo, setCodigo] = useState("");

  const [error, setError] = useState("");
  const [mensaje, setMensaje] = useState("");

  const [exito, setExito] = useState(false);
  const [cargando, setCargando] = useState(false);
  const [reenviando, setReenviando] = useState(false);

  async function verificar(evento) {
    evento.preventDefault();

    setError("");
    setMensaje("");

    if (!correo.trim()) {
      setError("Ingresa tu correo registrado.");
      return;
    }

    if (!/^\d{6}$/.test(codigo.trim())) {
      setError("El código debe tener seis dígitos.");
      return;
    }

    setCargando(true);

    try {
      await authService.verificarCorreo(
        correo.trim().toLowerCase(),
        codigo.trim()
      );

      sessionStorage.removeItem(
        "nalu_correo_pendiente"
      );

      setCodigo("");
      setExito(true);
    } catch (err) {
      setError(err.message);
    } finally {
      setCargando(false);
    }
  }

  async function reenviar() {
    setError("");
    setMensaje("");

    const email = correo.trim().toLowerCase();

    if (!email) {
      setError("Escribe tu correo antes de reenviar.");
      return;
    }

    setReenviando(true);

    try {
      const respuesta =
        await authService.reenviarRegistro(email);

      setCodigo("");

      setMensaje(
        respuesta.mensaje ||
        "La solicitud fue procesada."
      );
    } catch (err) {
      setError(err.message);
    } finally {
      setReenviando(false);
    }
  }

  return (
    <main className="auth-page auth-page-centered">
      <section className="auth-card auth-verification-card">
        {exito ? (
          <>
            <div className="auth-icon-circle success">
              <BadgeCheck size={40} />
            </div>

            <span className="eyebrow">
              REGISTRO COMPLETADO
            </span>

            <h1>¡Correo verificado!</h1>

            <p>
              Tu correo ha sido confirmado.
              Ya puedes iniciar sesión con
              tu cuenta de NALÚ LUXE.
            </p>

            <button
              type="button"
              className="btn btn-primary btn-block"
              onClick={() =>
                navigate("/login", { replace: true })
              }
            >
              Iniciar sesión
              <ArrowRight size={18} />
            </button>
          </>
        ) : (
          <>
            <div className="auth-icon-circle">
              <MailCheck size={39} />
            </div>

            <span className="eyebrow">
              PROTEGEMOS TU CUENTA
            </span>

            <h1>Verifica tu correo</h1>

            <p>
              Ingresa el código de seis dígitos
              generado para tu registro.
            </p>

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

            <form
              onSubmit={verificar}
              className="auth-form"
            >
              <label htmlFor="verificar-correo">
                Correo electrónico
              </label>

              <div className="auth-input">
                <input
                  id="verificar-correo"
                  type="email"
                  required
                  autoComplete="email"
                  placeholder="Tu correo registrado"
                  value={correo}
                  onChange={(e) =>
                    setCorreo(e.target.value)
                  }
                />
              </div>

              <label htmlFor="verificar-codigo">
                Código de verificación
              </label>

              <div className="auth-input auth-otp-input">
                <input
                  id="verificar-codigo"
                  type="text"
                  inputMode="numeric"
                  autoComplete="one-time-code"
                  maxLength={6}
                  pattern="[0-9]{6}"
                  required
                  placeholder="000000"
                  value={codigo}
                  onChange={(e) =>
                    setCodigo(
                      e.target.value.replace(/\D/g, "")
                    )
                  }
                />
              </div>

              <button
                type="submit"
                className="btn btn-primary btn-block auth-submit"
                disabled={cargando || reenviando}
              >
                {cargando
                  ? "Verificando..."
                  : "Verificar mi correo"}
              </button>
            </form>

            <button
              type="button"
              className="btn btn-outline btn-block"
              onClick={reenviar}
              disabled={reenviando || cargando}
            >
              <RefreshCcw size={17} />

              {reenviando
                ? "Procesando solicitud..."
                : "Solicitar otro código"}
            </button>

            <p className="auth-security-note">
              <ShieldCheck size={17} />
              Cada código vence en diez minutos.
              El reenvío está limitado a una
              solicitud por minuto.
            </p>

            <div className="auth-bottom">
              <Link to="/registro">
                Volver al registro
              </Link>
            </div>
          </>
        )}
      </section>
    </main>
  );
}
