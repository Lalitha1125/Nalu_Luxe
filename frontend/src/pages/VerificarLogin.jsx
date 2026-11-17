
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
} from "lucide-react";

import { authService } from "../services/authService";
import { useAuth } from "../context/AuthContext";

export default function VerificarLogin() {
  const navigate = useNavigate();
  const location = useLocation();

  const { iniciarSesion } = useAuth();

  const [correo, setCorreo] = useState(
    location.state?.correo ||
    sessionStorage.getItem("nalu_login_pendiente") ||
    ""
  );

  const [codigo, setCodigo] = useState("");
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState("");

  async function verificar(evento) {
    evento.preventDefault();
    setError("");

    const correoNormalizado =
      correo.trim().toLowerCase();

    if (!correoNormalizado) {
      setError("Debes ingresar tu correo.");
      return;
    }

    if (!/^\d{6}$/.test(codigo)) {
      setError("El código debe tener seis números.");
      return;
    }

    setCargando(true);

    try {
      const respuesta =
        await authService.verificarLogin(
          correoNormalizado,
          codigo
        );

      iniciarSesion(respuesta);

      sessionStorage.removeItem(
        "nalu_login_pendiente"
      );

      setCodigo("");

      if (respuesta.usuario?.rol === "ADMIN") {
        navigate("/admin", { replace: true });
      } else {
        navigate("/catalogo", { replace: true });
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setCargando(false);
    }
  }

  return (
    <main className="auth-page auth-page-centered">
      <section className="auth-card auth-verification-card">
        <div className="auth-icon-circle">
          <MailCheck size={40} />
        </div>

        <span className="eyebrow">
          SEGUNDO FACTOR DE SEGURIDAD
        </span>

        <h1>Confirma tu acceso</h1>

        <p>
          Introduce el código OTP de seis dígitos
          generado para iniciar sesión.
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
          onSubmit={verificar}
        >
          <label htmlFor="otp-login-correo">
            Correo electrónico
          </label>

          <div className="auth-input">
            <input
              id="otp-login-correo"
              type="email"
              autoComplete="email"
              value={correo}
              onChange={(e) => setCorreo(e.target.value)}
              required
              placeholder="Correo registrado"
            />
          </div>

          <label htmlFor="otp-login-codigo">
            Código OTP
          </label>

          <div className="auth-input auth-otp-input">
            <input
              id="otp-login-codigo"
              type="text"
              inputMode="numeric"
              autoComplete="one-time-code"
              maxLength={6}
              pattern="[0-9]{6}"
              placeholder="000000"
              value={codigo}
              onChange={(e) =>
                setCodigo(
                  e.target.value.replace(/\D/g, "")
                )
              }
              required
            />
          </div>

          <button
            type="submit"
            className="btn btn-primary btn-block auth-submit"
            disabled={cargando}
          >
            {cargando
              ? "Verificando..."
              : "Ingresar a NALÚ LUXE"}

            {!cargando && <ArrowRight size={18} />}
          </button>
        </form>

        <p className="auth-security-note">
          <ShieldCheck size={17} />
          El código vence en diez minutos.
          No lo compartas.
        </p>

        <div className="auth-bottom">
          ¿Necesitas empezar de nuevo?{" "}
          <Link to="/login">
            Volver al inicio de sesión
          </Link>
        </div>
      </section>
    </main>
  );
}
