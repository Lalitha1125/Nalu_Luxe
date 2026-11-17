
import { useState } from "react";
import {
  Link,
  useLocation,
  useNavigate,
} from "react-router-dom";

import {
  LockKeyhole,
  MailCheck,
  CheckCircle2,
  ArrowRight,
} from "lucide-react";

import { authService } from "../services/authService";
import { useAuth } from "../context/AuthContext";

export default function RestablecerClave() {
  const location = useLocation();
  const navigate = useNavigate();

  const { cerrarSesion, autenticado } = useAuth();

  const [correo, setCorreo] = useState(
    location.state?.correo ||
    sessionStorage.getItem(
      "nalu_recuperacion_pendiente"
    ) ||
    ""
  );

  const [codigo, setCodigo] = useState("");
  const [clave, setClave] = useState("");
  const [confirmacion, setConfirmacion] = useState("");

  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState("");
  const [terminado, setTerminado] = useState(false);

  async function restablecer(evento) {
    evento.preventDefault();
    setError("");

    if (!/^\d{6}$/.test(codigo)) {
      setError("Ingresa un código de seis dígitos.");
      return;
    }

    if (clave.length < 12) {
      setError(
        "La contraseña debe tener al menos 12 caracteres."
      );
      return;
    }

    if (clave !== confirmacion) {
      setError("Las contraseñas no coinciden.");
      return;
    }

    setCargando(true);

    try {
      await authService.restablecerClave(
        correo.trim().toLowerCase(),
        codigo,
        clave
      );

      sessionStorage.removeItem(
        "nalu_recuperacion_pendiente"
      );

      // La clave nueva revoca las sesiones en MySQL.
      // Eliminamos también la sesión de esta pestaña.
      if (autenticado) {
        try {
          await cerrarSesion();
        } catch {
          // La sesión ya fue revocada por el servidor.
        }
      }

      setClave("");
      setConfirmacion("");
      setCodigo("");
      setTerminado(true);
    } catch (err) {
      setError(err.message);
    } finally {
      setCargando(false);
    }
  }

  if (terminado) {
    return (
      <main className="auth-page auth-page-centered">
        <section className="auth-card auth-verification-card">
          <div className="auth-icon-circle success">
            <CheckCircle2 size={40} />
          </div>

          <h1>¡Contraseña actualizada!</h1>

          <p>
            Tu nueva contraseña quedó guardada.
            Inicia sesión nuevamente para continuar.
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
        </section>
      </main>
    );
  }

  return (
    <main className="auth-page auth-page-centered">
      <section className="auth-card auth-verification-card">
        <div className="auth-icon-circle">
          <MailCheck size={39} />
        </div>

        <span className="eyebrow">
          RECUPERACIÓN DE CUENTA
        </span>

        <h1>Nueva contraseña</h1>

        <p>
          Introduce el código de recuperación
          y elige una contraseña segura.
        </p>

        {error && (
          <div
            className="auth-alert auth-alert-error"
            role="alert"
          >
            {error}
          </div>
        )}

        <form
          className="auth-form"
          onSubmit={restablecer}
        >
          <label htmlFor="reset-correo">
            Correo electrónico
          </label>

          <div className="auth-input">
            <input
              id="reset-correo"
              type="email"
              required
              autoComplete="email"
              value={correo}
              onChange={(e) =>
                setCorreo(e.target.value)
              }
            />
          </div>

          <label htmlFor="reset-codigo">
            Código OTP
          </label>

          <div className="auth-input auth-otp-input">
            <input
              id="reset-codigo"
              type="text"
              inputMode="numeric"
              autoComplete="one-time-code"
              pattern="[0-9]{6}"
              maxLength={6}
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

          <label htmlFor="reset-clave">
            Nueva contraseña
          </label>

          <div className="auth-input">
            <LockKeyhole size={19} />

            <input
              id="reset-clave"
              type="password"
              autoComplete="new-password"
              minLength={12}
              required
              placeholder="Mínimo 12 caracteres"
              value={clave}
              onChange={(e) =>
                setClave(e.target.value)
              }
            />
          </div>

          <label htmlFor="reset-confirmacion">
            Confirmar nueva contraseña
          </label>

          <div className="auth-input">
            <LockKeyhole size={19} />

            <input
              id="reset-confirmacion"
              type="password"
              autoComplete="new-password"
              required
              placeholder="Repite la contraseña"
              value={confirmacion}
              onChange={(e) =>
                setConfirmacion(e.target.value)
              }
            />
          </div>

          <button
            type="submit"
            className="btn btn-primary btn-block auth-submit"
            disabled={cargando}
          >
            {cargando
              ? "Actualizando..."
              : "Guardar nueva contraseña"}
          </button>
        </form>

        <div className="auth-bottom">
          <Link to="/recuperar-clave">
            Solicitar un nuevo código
          </Link>
        </div>
      </section>
    </main>
  );
}
