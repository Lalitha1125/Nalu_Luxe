
import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";

import {
  UserRound,
  Mail,
  Phone,
  ShieldCheck,
  Save,
  ArrowLeft,
  BadgeCheck,
} from "lucide-react";

import { useAuth } from "../context/AuthContext";
import { perfilService } from "../services/perfilService";

import AccesosMiCuenta from "../components/AccesosMiCuenta";

import "../accesosMiCuenta.css";

export default function MiCuenta() {
  const navigate = useNavigate();

  const {
    token,
    refrescarUsuario,
  } = useAuth();

  // ==========================================
  // ESTADO DEL PERFIL
  // ==========================================

  const [perfil, setPerfil] = useState(null);

  const [formulario, setFormulario] = useState({
    nombre: "",
    telefono: "",
  });

  const [cargando, setCargando] = useState(true);
  const [guardando, setGuardando] = useState(false);

  const [error, setError] = useState("");
  const [mensaje, setMensaje] = useState("");

  // ==========================================
  // CARGAR PERFIL DESDE MYSQL
  // ==========================================

  useEffect(() => {
    let activo = true;

    async function cargarPerfil() {
      setCargando(true);
      setError("");

      try {
        const datos = await perfilService.obtener(token);

        if (!activo) {
          return;
        }

        setPerfil(datos);

        setFormulario({
          nombre: datos.nombre || "",
          telefono: datos.telefono || "",
        });
      } catch (err) {
        if (activo) {
          setError(err.message);
        }
      } finally {
        if (activo) {
          setCargando(false);
        }
      }
    }

    if (token) {
      cargarPerfil();
    } else {
      setCargando(false);
    }

    return () => {
      activo = false;
    };
  }, [token]);

  // ==========================================
  // ACTUALIZAR CAMPOS DEL FORMULARIO
  // ==========================================

  function actualizar(evento) {
    const { name, value } = evento.target;

    setFormulario((anterior) => ({
      ...anterior,
      [name]: value,
    }));

    setMensaje("");
  }

  // ==========================================
  // GUARDAR DATOS PERSONALES
  // ==========================================

  async function guardar(evento) {
    evento.preventDefault();

    setError("");
    setMensaje("");

    const nombre = formulario.nombre.trim();
    const telefono = formulario.telefono.trim();

    if (nombre.length < 2) {
      setError(
        "Escribe un nombre de al menos dos caracteres."
      );
      return;
    }

    setGuardando(true);

    try {
      const actualizado = await perfilService.actualizar(
        token,
        {
          nombre,
          telefono,
        }
      );

      setPerfil(actualizado);

      setFormulario({
        nombre: actualizado.nombre || "",
        telefono: actualizado.telefono || "",
      });

      await refrescarUsuario();

      setMensaje(
        "¡Tus datos se actualizaron correctamente!"
      );
    } catch (err) {
      setError(err.message);
    } finally {
      setGuardando(false);
    }
  }

  // ==========================================
  // PANTALLA DE CARGA
  // ==========================================

  if (cargando) {
    return (
      <main className="container section">
        <p className="info-message">
          Cargando tu perfil desde MySQL...
        </p>
      </main>
    );
  }

  // ==========================================
  // PÁGINA MI CUENTA
  // ==========================================

  return (
    <main className="account-page">
      <div className="container">
        <Link
          to="/catalogo"
          className="back-link"
        >
          <ArrowLeft size={18} />
          Volver al catálogo
        </Link>

        <div className="page-heading">
          <span className="eyebrow">
            TU ESPACIO PERSONAL
          </span>

          <h1>Mi cuenta</h1>

          <p>
            Consulta tus datos personales,
            direcciones y pedidos en NALÚ LUXE.
          </p>
        </div>

        {/* MENSAJES DE ERROR */}

        {error && (
          <div
            className="auth-alert auth-alert-error"
            role="alert"
          >
            <p>{error}</p>

            {!perfil && (
              <button
                type="button"
                className="btn btn-outline"
                onClick={() =>
                  navigate("/login")
                }
              >
                Ir al inicio de sesión
              </button>
            )}
          </div>
        )}

        {perfil && (
          <>
            <div className="account-grid">
              {/* ============================ */}
              {/* INFORMACIÓN DE LA CUENTA */}
              {/* ============================ */}

              <aside className="account-summary">
                <div className="account-avatar">
                  <UserRound size={43} />
                </div>

                <h2>{perfil.nombre}</h2>

                <p>{perfil.correo}</p>

                <div className="account-role">
                  <ShieldCheck size={18} />
                  {perfil.rol}
                </div>

                {perfil.correoVerificado && (
                  <div className="account-verified">
                    <BadgeCheck size={18} />
                    Correo verificado
                  </div>
                )}

                <div className="account-help">
                  <h3>Tu cuenta NALÚ LUXE</h3>

                  <p>
                    Tus datos son privados y solo
                    puedes editarlos cuando tu
                    sesión está activa.
                  </p>
                </div>
              </aside>

              {/* ============================ */}
              {/* PANEL DERECHO DEL PERFIL */}
              {/* ============================ */}

              <div className="nalu-account-main">
                {/* DIRECCIONES Y PEDIDOS */}

                <AccesosMiCuenta />

                {/* EDITAR DATOS PERSONALES */}

                <section className="account-form-card">
                  <div className="account-form-title">
                    <UserRound size={25} />

                    <div>
                      <h2>Información personal</h2>

                      <p>
                        Actualiza tu nombre y teléfono.
                      </p>
                    </div>
                  </div>

                  {mensaje && (
                    <div
                      className="account-success"
                      role="status"
                    >
                      <BadgeCheck size={20} />
                      {mensaje}
                    </div>
                  )}

                  <form
                    className="auth-form"
                    onSubmit={guardar}
                  >
                    {/* NOMBRE */}

                    <label htmlFor="cuenta-nombre">
                      Nombre completo
                    </label>

                    <div className="auth-input">
                      <UserRound size={19} />

                      <input
                        id="cuenta-nombre"
                        name="nombre"
                        type="text"
                        autoComplete="name"
                        maxLength={120}
                        required
                        value={formulario.nombre}
                        onChange={actualizar}
                      />
                    </div>

                    {/* CORREO */}

                    <label htmlFor="cuenta-correo">
                      Correo electrónico
                    </label>

                    <div className="auth-input account-readonly">
                      <Mail size={19} />

                      <input
                        id="cuenta-correo"
                        type="email"
                        value={perfil.correo}
                        readOnly
                      />
                    </div>

                    <p className="account-field-help">
                      El correo no puede cambiarse
                      desde este formulario por seguridad.
                    </p>

                    {/* TELÉFONO */}

                    <label htmlFor="cuenta-telefono">
                      Teléfono
                    </label>

                    <div className="auth-input">
                      <Phone size={19} />

                      <input
                        id="cuenta-telefono"
                        name="telefono"
                        type="tel"
                        autoComplete="tel"
                        maxLength={25}
                        placeholder="Tu número de contacto"
                        value={formulario.telefono}
                        onChange={actualizar}
                      />
                    </div>

                    {/* GUARDAR CAMBIOS */}

                    <button
                      type="submit"
                      className="btn btn-primary auth-submit"
                      disabled={guardando}
                    >
                      <Save size={18} />

                      {guardando
                        ? "Guardando..."
                        : "Guardar cambios"}
                    </button>
                  </form>
                </section>
              </div>
            </div>
          </>
        )}
      </div>
    </main>
  );
}
