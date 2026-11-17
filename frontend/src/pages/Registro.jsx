
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Gem,
  Mail,
  LockKeyhole,
  UserRound,
  Phone,
  Eye,
  EyeOff,
  ShieldCheck,
  ArrowRight,
} from "lucide-react";

import { authService } from "../services/authService";

const formularioInicial = {
  nombre: "",
  correo: "",
  contrasena: "",
  confirmarContrasena: "",
  telefono: "",
};

export default function Registro() {
  const navigate = useNavigate();

  const [formulario, setFormulario] =
    useState(formularioInicial);

  const [mostrarClave, setMostrarClave] = useState(false);
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState("");

  function actualizar(evento) {
    const { name, value } = evento.target;

    setFormulario((anterior) => ({
      ...anterior,
      [name]: value,
    }));
  }

  async function registrar(evento) {
    evento.preventDefault();
    setError("");

    const nombre = formulario.nombre.trim();
    const correo = formulario.correo.trim().toLowerCase();

    if (nombre.length < 2) {
      setError("Ingresa tu nombre completo.");
      return;
    }

    if (formulario.contrasena.length < 12) {
      setError(
        "La contraseña debe tener mínimo 12 caracteres."
      );
      return;
    }

    if (
      formulario.contrasena !==
      formulario.confirmarContrasena
    ) {
      setError("Las contraseñas no coinciden.");
      return;
    }

    setCargando(true);

    try {
      await authService.registrar({
        nombre,
        correo,
        contrasena: formulario.contrasena,
        telefono: formulario.telefono.trim(),
      });

      sessionStorage.setItem(
        "nalu_correo_pendiente",
        correo
      );

      navigate("/verificar-correo", {
        replace: true,
        state: { correo },
      });
    } catch (err) {
      setError(err.message);
    } finally {
      setCargando(false);
    }
  }

  return (
    <main className="auth-page">
      <div className="container auth-layout">
        <section className="auth-presentation">
          <div className="auth-presentation-inner">
            <Gem size={46} strokeWidth={1.3} />

            <span className="eyebrow">
              BIENVENIDA A NALÚ LUXE
            </span>

            <h1>
              Tu esencia merece
              <em> brillar.</em>
            </h1>

            <p>
              Crea tu cuenta para formar parte
              de nuestra comunidad y descubrir
              joyas especiales para cada momento.
            </p>

            <div className="auth-presentation-details">
              <span>✧ Elegancia</span>
              <span>✧ Delicadeza</span>
              <span>✧ Estilo</span>
            </div>
          </div>
        </section>

        <section className="auth-card">
          <div className="auth-card-heading">
            <span className="eyebrow">NALÚ LUXE</span>
            <h2>Crear mi cuenta</h2>
            <p>
              Completa tus datos para registrarte
              como cliente.
            </p>
          </div>

          {error && (
            <div className="auth-alert auth-alert-error" role="alert">
              {error}
            </div>
          )}

          <form onSubmit={registrar} className="auth-form">
            <label htmlFor="registro-nombre">
              Nombre completo
            </label>

            <div className="auth-input">
              <UserRound size={19} />
              <input
                id="registro-nombre"
                name="nombre"
                type="text"
                placeholder="Tu nombre completo"
                autoComplete="name"
                maxLength={120}
                required
                value={formulario.nombre}
                onChange={actualizar}
              />
            </div>

            <label htmlFor="registro-correo">
              Correo electrónico
            </label>

            <div className="auth-input">
              <Mail size={19} />
              <input
                id="registro-correo"
                name="correo"
                type="email"
                placeholder="ejemplo@correo.com"
                autoComplete="email"
                maxLength={150}
                required
                value={formulario.correo}
                onChange={actualizar}
              />
            </div>

            <label htmlFor="registro-telefono">
              Teléfono (opcional)
            </label>

            <div className="auth-input">
              <Phone size={19} />
              <input
                id="registro-telefono"
                name="telefono"
                type="tel"
                placeholder="Número de contacto"
                autoComplete="tel"
                maxLength={25}
                value={formulario.telefono}
                onChange={actualizar}
              />
            </div>

            <label htmlFor="registro-clave">
              Contraseña
            </label>

            <div className="auth-input">
              <LockKeyhole size={19} />
              <input
                id="registro-clave"
                name="contrasena"
                type={mostrarClave ? "text" : "password"}
                placeholder="Mínimo 12 caracteres"
                autoComplete="new-password"
                minLength={12}
                maxLength={72}
                required
                value={formulario.contrasena}
                onChange={actualizar}
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
                  setMostrarClave(!mostrarClave)
                }
              >
                {mostrarClave ? (
                  <EyeOff size={19} />
                ) : (
                  <Eye size={19} />
                )}
              </button>
            </div>

            <label htmlFor="registro-confirmar">
              Confirmar contraseña
            </label>

            <div className="auth-input">
              <LockKeyhole size={19} />
              <input
                id="registro-confirmar"
                name="confirmarContrasena"
                type="password"
                placeholder="Repite tu contraseña"
                autoComplete="new-password"
                required
                value={formulario.confirmarContrasena}
                onChange={actualizar}
              />
            </div>

            <button
              type="submit"
              className="btn btn-primary btn-block auth-submit"
              disabled={cargando}
            >
              {cargando
                ? "Creando tu cuenta..."
                : "Crear cuenta"}

              {!cargando && <ArrowRight size={18} />}
            </button>

            <p className="auth-security-note">
              <ShieldCheck size={17} />
              Verificaremos tu correo antes de
              habilitar el acceso a tu cuenta.
            </p>
          </form>

          <div className="auth-bottom">
            ¿Quieres seguir explorando?{" "}
            <Link to="/catalogo">
              Ver catálogo
            </Link>
          </div>
        </section>
      </div>
    </main>
  );
}
