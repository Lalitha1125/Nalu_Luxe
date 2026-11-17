
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

import {
  Mail,
  KeyRound,
  ArrowRight,
  ShieldCheck,
} from "lucide-react";

import { authService } from "../services/authService";

export default function RecuperarClave() {
  const navigate = useNavigate();

  const [correo, setCorreo] = useState("");
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState("");

  async function enviar(evento) {
    evento.preventDefault();
    setError("");
    setCargando(true);

    const email = correo.trim().toLowerCase();

    try {
      await authService.solicitarRecuperacion(email);

      sessionStorage.setItem(
        "nalu_recuperacion_pendiente",
        email
      );

      navigate("/restablecer-clave", {
        state: { correo: email },
      });
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
          <KeyRound size={39} />
        </div>

        <span className="eyebrow">
          SEGURIDAD NALÚ LUXE
        </span>

        <h1>Recuperar contraseña</h1>

        <p>
          Introduce el correo de tu cuenta.
          Si está activa y verificada,
          generaremos un código de recuperación.
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
          onSubmit={enviar}
        >
          <label htmlFor="recuperar-correo">
            Correo electrónico
          </label>

          <div className="auth-input">
            <Mail size={19} />

            <input
              id="recuperar-correo"
              type="email"
              autoComplete="email"
              placeholder="ejemplo@correo.com"
              required
              maxLength={150}
              value={correo}
              onChange={(e) =>
                setCorreo(e.target.value)
              }
            />
          </div>

          <button
            type="submit"
            className="btn btn-primary btn-block auth-submit"
            disabled={cargando}
          >
            {cargando
              ? "Procesando..."
              : "Continuar"}

            {!cargando && <ArrowRight size={18} />}
          </button>
        </form>

        <p className="auth-security-note">
          <ShieldCheck size={17} />
          El sistema no revelará si una
          dirección de correo está registrada.
        </p>

        <div className="auth-bottom">
          <Link to="/login">
            Volver al inicio de sesión
          </Link>
        </div>
      </section>
    </main>
  );
}
