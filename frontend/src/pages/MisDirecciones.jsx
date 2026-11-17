
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

import {
  MapPin,
  Plus,
  Pencil,
  Trash2,
  Star,
  Save,
  X,
  ArrowLeft,
} from "lucide-react";

import { useAuth } from "../context/AuthContext";
import { direccionService } from "../services/direccionService";

const vacio = {
  etiqueta: "Casa",
  ciudad: "",
  localidad: "",
  barrio: "",
  direccion: "",
  indicaciones: "",
  principal: false,
};

export default function MisDirecciones() {
  const { token } = useAuth();

  const [direcciones, setDirecciones] = useState([]);
  const [formulario, setFormulario] = useState(vacio);

  const [editandoId, setEditandoId] = useState(null);
  const [mostrarFormulario, setMostrarFormulario] =
    useState(false);

  const [cargando, setCargando] = useState(true);
  const [guardando, setGuardando] = useState(false);
  const [accionandoId, setAccionandoId] = useState(null);

  const [error, setError] = useState("");
  const [mensaje, setMensaje] = useState("");

  useEffect(() => {
    let activo = true;

    async function cargar() {
      setCargando(true);

      try {
        const datos = await direccionService.listar(token);

        if (activo) {
          setDirecciones(datos);
        }
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

    if (token) cargar();

    return () => {
      activo = false;
    };
  }, [token]);

  async function recargar() {
    const datos = await direccionService.listar(token);
    setDirecciones(datos);
  }

  function nuevaDireccion() {
    setFormulario({ ...vacio });
    setEditandoId(null);
    setMostrarFormulario(true);
    setError("");
    setMensaje("");
  }

  function editar(direccion) {
    setFormulario({
      etiqueta: direccion.etiqueta || "Casa",
      ciudad: direccion.ciudad || "",
      localidad: direccion.localidad || "",
      barrio: direccion.barrio || "",
      direccion: direccion.direccion || "",
      indicaciones: direccion.indicaciones || "",
      principal: Boolean(direccion.principal),
    });

    setEditandoId(direccion.id);
    setMostrarFormulario(true);
    setError("");
    setMensaje("");

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  }

  function cambiar(evento) {
    const { name, value, type, checked } = evento.target;

    setFormulario((anterior) => ({
      ...anterior,
      [name]: type === "checkbox" ? checked : value,
    }));
  }

  async function guardar(evento) {
    evento.preventDefault();

    setError("");
    setMensaje("");

    if (
      !formulario.etiqueta.trim() ||
      !formulario.ciudad.trim() ||
      !formulario.direccion.trim()
    ) {
      setError(
        "La etiqueta, la ciudad y la dirección son obligatorias."
      );
      return;
    }

    setGuardando(true);

    const datos = {
      etiqueta: formulario.etiqueta.trim(),
      ciudad: formulario.ciudad.trim(),
      localidad: formulario.localidad.trim(),
      barrio: formulario.barrio.trim(),
      direccion: formulario.direccion.trim(),
      indicaciones: formulario.indicaciones.trim(),
      principal: formulario.principal,
    };

    try {
      if (editandoId !== null) {
        await direccionService.actualizar(
          token,
          editandoId,
          datos
        );
      } else {
        await direccionService.crear(token, datos);
      }

      await recargar();

      setMostrarFormulario(false);
      setEditandoId(null);
      setFormulario({ ...vacio });

      setMensaje(
        "¡Tu dirección se guardó correctamente!"
      );
    } catch (err) {
      setError(err.message);
    } finally {
      setGuardando(false);
    }
  }

  async function marcarPrincipal(id) {
    setAccionandoId(id);
    setError("");
    setMensaje("");

    try {
      await direccionService.principal(token, id);
      await recargar();

      setMensaje(
        "La dirección principal fue actualizada."
      );
    } catch (err) {
      setError(err.message);
    } finally {
      setAccionandoId(null);
    }
  }

  async function eliminar(id) {
    const confirmado = window.confirm(
      "¿Deseas eliminar esta dirección?"
    );

    if (!confirmado) return;

    setAccionandoId(id);
    setError("");
    setMensaje("");

    try {
      await direccionService.eliminar(token, id);
      await recargar();

      setMensaje(
        "Dirección eliminada correctamente."
      );
    } catch (err) {
      setError(err.message);
    } finally {
      setAccionandoId(null);
    }
  }

  return (
    <main className="addresses-page">
      <div className="container">
        <Link to="/mi-cuenta" className="addresses-back">
          <ArrowLeft size={18} />
          Volver a mi cuenta
        </Link>

        <div className="addresses-heading">
          <div>
            <span className="eyebrow">
              NALÚ LUXE · MI CUENTA
            </span>

            <h1>Mis direcciones</h1>

            <p>
              Administra las direcciones donde
              quieres recibir tus joyas.
            </p>
          </div>

          {!mostrarFormulario && (
            <button
              type="button"
              className="btn btn-primary"
              onClick={nuevaDireccion}
            >
              <Plus size={18} />
              Nueva dirección
            </button>
          )}
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

        {mostrarFormulario && (
          <section className="addresses-form-card">
            <div className="addresses-form-header">
              <h2>
                {editandoId !== null
                  ? "Editar dirección"
                  : "Agregar dirección"}
              </h2>

              <button
                type="button"
                className="addresses-icon-button"
                aria-label="Cerrar formulario"
                onClick={() =>
                  setMostrarFormulario(false)
                }
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={guardar}>
              <div className="addresses-fields">
                <div>
                  <label htmlFor="dir-etiqueta">
                    Nombre de la dirección
                  </label>

                  <input
                    id="dir-etiqueta"
                    name="etiqueta"
                    type="text"
                    maxLength={50}
                    placeholder="Casa, trabajo..."
                    value={formulario.etiqueta}
                    onChange={cambiar}
                    required
                  />
                </div>

                <div>
                  <label htmlFor="dir-ciudad">
                    Ciudad
                  </label>

                  <input
                    id="dir-ciudad"
                    name="ciudad"
                    type="text"
                    maxLength={100}
                    placeholder="Bogotá"
                    value={formulario.ciudad}
                    onChange={cambiar}
                    required
                  />
                </div>

                <div>
                  <label htmlFor="dir-localidad">
                    Localidad o municipio
                  </label>

                  <input
                    id="dir-localidad"
                    name="localidad"
                    type="text"
                    maxLength={100}
                    placeholder="Localidad (opcional)"
                    value={formulario.localidad}
                    onChange={cambiar}
                  />
                </div>

                <div>
                  <label htmlFor="dir-barrio">
                    Barrio
                  </label>

                  <input
                    id="dir-barrio"
                    name="barrio"
                    type="text"
                    maxLength={100}
                    placeholder="Barrio (opcional)"
                    value={formulario.barrio}
                    onChange={cambiar}
                  />
                </div>

                <div className="addresses-wide">
                  <label htmlFor="dir-direccion">
                    Dirección completa
                  </label>

                  <input
                    id="dir-direccion"
                    name="direccion"
                    type="text"
                    maxLength={200}
                    placeholder="Calle, carrera, número, apartamento..."
                    value={formulario.direccion}
                    onChange={cambiar}
                    required
                  />
                </div>

                <div className="addresses-wide">
                  <label htmlFor="dir-indicaciones">
                    Indicaciones adicionales
                  </label>

                  <textarea
                    id="dir-indicaciones"
                    name="indicaciones"
                    rows={3}
                    maxLength={300}
                    placeholder="Torre, portería, referencias..."
                    value={formulario.indicaciones}
                    onChange={cambiar}
                  />
                </div>
              </div>

              <label className="addresses-checkbox">
                <input
                  type="checkbox"
                  name="principal"
                  checked={formulario.principal}
                  onChange={cambiar}
                />

                Establecer como dirección principal
              </label>

              <div className="addresses-form-actions">
                <button
                  type="button"
                  className="btn btn-outline"
                  onClick={() =>
                    setMostrarFormulario(false)
                  }
                >
                  Cancelar
                </button>

                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={guardando}
                >
                  <Save size={18} />
                  {guardando
                    ? "Guardando..."
                    : "Guardar dirección"}
                </button>
              </div>
            </form>
          </section>
        )}

        {cargando ? (
          <p>Cargando direcciones...</p>
        ) : direcciones.length === 0 ? (
          <div className="addresses-empty">
            <MapPin size={48} />

            <h2>Aún no tienes direcciones</h2>

            <p>
              Registra una dirección para tener
              preparados tus datos de entrega.
            </p>

            {!mostrarFormulario && (
              <button
                type="button"
                className="btn btn-primary"
                onClick={nuevaDireccion}
              >
                Agregar mi primera dirección
              </button>
            )}
          </div>
        ) : (
          <div className="addresses-grid">
            {direcciones.map((direccion) => (
              <article
                key={direccion.id}
                className={
                  direccion.principal
                    ? "address-card is-primary"
                    : "address-card"
                }
              >
                <div className="address-card-top">
                  <div className="address-card-icon">
                    <MapPin size={24} />
                  </div>

                  <div>
                    <h2>{direccion.etiqueta}</h2>

                    {direccion.principal && (
                      <span className="address-primary-badge">
                        <Star size={13} />
                        Principal
                      </span>
                    )}
                  </div>
                </div>

                <p className="address-line">
                  {direccion.direccion}
                </p>

                <p className="address-muted">
                  {[
                    direccion.barrio,
                    direccion.localidad,
                    direccion.ciudad,
                  ].filter(Boolean).join(", ")}
                </p>

                {direccion.indicaciones && (
                  <p className="address-muted">
                    {direccion.indicaciones}
                  </p>
                )}

                <div className="address-actions">
                  {!direccion.principal && (
                    <button
                      type="button"
                      onClick={() =>
                        marcarPrincipal(direccion.id)
                      }
                      disabled={accionandoId !== null}
                    >
                      <Star size={16} />
                      Principal
                    </button>
                  )}

                  <button
                    type="button"
                    onClick={() => editar(direccion)}
                    disabled={accionandoId !== null}
                  >
                    <Pencil size={16} />
                    Editar
                  </button>

                  <button
                    type="button"
                    className="address-delete"
                    onClick={() =>
                      eliminar(direccion.id)
                    }
                    disabled={accionandoId !== null}
                  >
                    <Trash2 size={16} />
                    Eliminar
                  </button>
                </div>
              </article>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
