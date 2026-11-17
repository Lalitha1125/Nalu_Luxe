
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

import {
  Gem,
  Mail,
  LockKeyhole,
  Eye,
  EyeOff,
  ArrowRight,
  ShieldCheck,
} from "lucide-react";

import { authService } from "../services/authService";
import { useAuth } from "../context/AuthContext";

export default function Login() {
  const navigate = useNavigate();

  const {
    autenticado,
    usuario,
    verificandoSesion,
  } = useAuth();

  const [correo, setCorreo] = useState("");
  const [contrasena, setContrasena] = useState("");
  const [mostrarClave, setMostrarClave] = useState(false);
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState("");

  async function enviar(evento) {
    evento.preventDefault();
    setError("");

    const email = correo.trim().toLowerCase();

    if (!email || !contrasena) {
      setError("Completa tu correo y contraseña.");
      return;
    }

    setCargando(true);

    try {
      await authService.iniciarSesion(
        email,
        contrasena
      );

      sessionStorage.setItem(
        "nalu_login_pendiente",
        email
      );

      setContrasena("");

      navigate("/verificar-login", {
        state: { correo: email },
      });
    } catch (err) {
      setError(err.message);
    } finally {
      setCargando(false);
    }
  }

  if (verificandoSesion) {
    return (
      <main className="auth-page auth-page-centered">
        <p>Comprobando tu sesión...</p>
      </main>
    );
  }

  if (autenticado) {
    return (
      <main className="auth-page auth-page-centered">
        <section className="auth-card auth-verification-card">
          <Gem size={42} color="#b99561" />

          <h1>¡Hola, {usuario.nombre}!</h1>

          <p>Ya tienes una sesión iniciada.</p>

          <Link
            to={
              usuario.rol === "ADMIN"
                ? "/admin"
                : "/catalogo"
            }
            className="btn btn-primary btn-block"
          >
            Continuar
            <ArrowRight size={18} />
          </Link>
        </section>
      </main>
    );
  }

  return (
    <main className="auth-page">
      <div className="container auth-layout">
        <section className="auth-presentation">
          <div className="auth-presentation-inner">
            <Gem size={48} strokeWidth={1.3} />

            <span className="eyebrow">
              NALÚ LUXE · JEWELRY COLLECTION
            </span>

            <h1>
              Qué alegría
              <em> tenerte de vuelta.</em>
            </h1>

            <p>
              Vuelve a descubrir nuestras colecciones
              y encuentra el detalle perfecto para ti.
            </p>

            <div className="auth-presentation-details">
              <span>✧ Estilo</span>
              <span>✧ Elegancia</span>
              <span>✧ Confianza</span>
            </div>
          </div>
        </section>

        <section className="auth-card">
          <div className="auth-card-heading">
            <span className="eyebrow">
              BIENVENIDA DE NUEVO
            </span>

            <h2>Iniciar sesión</h2>

            <p>
              Ingresa tus datos y confirma
              tu identidad con un código OTP.
            </p>
          </div>

          {error && (
            <div
              className="auth-alert auth-alert-error"
              role="alert"
            >
              {error}
            </div>
          )}

          <form className="auth-form" onSubmit={enviar}>
            <label htmlFor="login-correo">
              Correo electrónico
            </label>

            <div className="auth-input">
              <Mail size={19} />

              <input
                id="login-correo"
                type="email"
                autoComplete="email"
                placeholder="ejemplo@correo.com"
                value={correo}
                onChange={(e) =>
                  setCorreo(e.target.value)
                }
                required
                maxLength={150}
              />
            </div>

            <label htmlFor="login-clave">
              Contraseña
            </label>

            <div className="auth-input">
              <LockKeyhole size={19} />

              <input
                id="login-clave"
                type={
                  mostrarClave ? "text" : "password"
                }
                autoComplete="current-password"
                placeholder="Tu contraseña"
                value={contrasena}
                onChange={(e) =>
                  setContrasena(e.target.value)
                }
                required
              />

              <button
                type="button"
                className="auth-eye"
                aria-label={
                  mostrarClave
                    ? "Ocultar contraseña"
                    : "Mostrar contraseña"
                }
                onClick={() =>
                  setMostrarClave((actual) => !actual)
                }
              >
                {mostrarClave
                  ? <EyeOff size={19} />
                  : <Eye size={19} />}
              </button>
            </div>

            <div className="auth-forgot-link">
              <Link to="/recuperar-clave">
                ¿Olvidaste tu contraseña?
              </Link>
            </div>

            <button
              type="submit"
              className="btn btn-primary btn-block auth-submit"
              disabled={cargando}
            >
              {cargando
                ? "Comprobando credenciales..."
                : "Continuar"}

              {!cargando && <ArrowRight size={18} />}
            </button>

            <p className="auth-security-note">
              <ShieldCheck size={17} />
              Por seguridad, necesitarás verificar
              un código adicional para ingresar.
            </p>
          </form>

          <div className="auth-bottom">
            ¿Todavía no tienes cuenta?{" "}
            <Link to="/registro">
              Regístrate aquí
            </Link>

            <p>
              <Link to="/catalogo">
                Seguir explorando sin iniciar sesión
              </Link>
            </p>
          </div>
        </section>
      </div>
    </main>
  );
}
