
import { useState } from "react";

import {
  Mail,
  MessageCircle,
  Send,
  CheckCircle2,
  Gem,
} from "lucide-react";

import { consultaService } from "../services/consultaService";

const formularioInicial = {
  nombre: "",
  correo: "",
  asunto: "",
  mensaje: "",
};

export default function Contacto() {
  const [formulario, setFormulario] =
    useState(formularioInicial);

  const [enviando, setEnviando] = useState(false);
  const [error, setError] = useState("");
  const [exito, setExito] = useState("");

  function cambiar(evento) {
    const { name, value } = evento.target;

    setFormulario((anterior) => ({
      ...anterior,
      [name]: value,
    }));
  }

  async function enviar(evento) {
    evento.preventDefault();

    setError("");
    setExito("");

    const datos = {
      nombre: formulario.nombre.trim(),
      correo: formulario.correo.trim().toLowerCase(),
      asunto: formulario.asunto.trim(),
      mensaje: formulario.mensaje.trim(),
    };

    if (
      datos.nombre.length < 2 ||
      datos.asunto.length < 3 ||
      datos.mensaje.length < 10
    ) {
      setError(
        "Completa el nombre, asunto y mensaje correctamente."
      );
      return;
    }

    setEnviando(true);

    try {
      const respuesta = await consultaService.enviar(datos);

      setExito(
        respuesta.mensaje ||
        "Tu consulta fue registrada."
      );

      setFormulario({ ...formularioInicial });
    } catch (err) {
      setError(err.message);
    } finally {
      setEnviando(false);
    }
  }

  return (
    <main className="contact-page">
      <div className="container">
        <div className="contact-heading">
          <Gem size={42} strokeWidth={1.4} />

          <span className="eyebrow">
            NALÚ LUXE · ATENCIÓN AL CLIENTE
          </span>

          <h1>Estamos para ayudarte</h1>

          <p>
            ¿Tienes una pregunta sobre nuestras joyas,
            un pedido o las colecciones?
            Escríbenos mediante este formulario.
          </p>
        </div>

        <div className="contact-layout">
          <aside className="contact-aside">
            <MessageCircle size={35} />

            <h2>Tu mensaje importa</h2>

            <p>
              Cuéntanos qué necesitas.
              Nuestro equipo podrá consultar
              tu solicitud desde el panel
              administrativo de NALÚ LUXE.
            </p>

            <div className="contact-aside-detail">
              <Mail size={20} />

              <span>
                Utilizaremos el correo indicado
                para identificar tu consulta.
              </span>
            </div>
          </aside>

          <section className="contact-card">
            <h2>Envíanos una consulta</h2>

            <p>
              Todos los campos son obligatorios.
            </p>

            {error && (
              <div
                className="auth-alert auth-alert-error"
                role="alert"
              >
                {error}
              </div>
            )}

            {exito && (
              <div
                className="account-success"
                role="status"
              >
                <CheckCircle2 size={19} />
                {exito}
              </div>
            )}

            <form
              className="contact-form"
              onSubmit={enviar}
            >
              <label htmlFor="contacto-nombre">
                Nombre completo
              </label>

              <input
                id="contacto-nombre"
                name="nombre"
                type="text"
                autoComplete="name"
                placeholder="Tu nombre"
                maxLength={120}
                required
                value={formulario.nombre}
                onChange={cambiar}
              />

              <label htmlFor="contacto-correo">
                Correo electrónico
              </label>

              <input
                id="contacto-correo"
                name="correo"
                type="email"
                autoComplete="email"
                placeholder="Tu correo"
                maxLength={150}
                required
                value={formulario.correo}
                onChange={cambiar}
              />

              <label htmlFor="contacto-asunto">
                Asunto
              </label>

              <input
                id="contacto-asunto"
                name="asunto"
                type="text"
                placeholder="¿En qué podemos ayudarte?"
                maxLength={150}
                required
                value={formulario.asunto}
                onChange={cambiar}
              />

              <label htmlFor="contacto-mensaje">
                Mensaje
              </label>

              <textarea
                id="contacto-mensaje"
                name="mensaje"
                rows={6}
                minLength={10}
                maxLength={3000}
                placeholder="Escribe tu consulta..."
                required
                value={formulario.mensaje}
                onChange={cambiar}
              />

              <button
                type="submit"
                className="btn btn-primary btn-block"
                disabled={enviando}
              >
                <Send size={17} />

                {enviando
                  ? "Enviando consulta..."
                  : "Enviar consulta"}
              </button>
            </form>
          </section>
        </div>
      </div>
    </main>
  );
}
