
import { useState } from "react";

import {
  NavLink,
  Link,
  useNavigate,
} from "react-router-dom";

import {
  Gem,
  ShoppingCart,
  Menu,
  X,
  UserRound,
  LogOut,
  ShieldCheck,
  ArrowUpRight,
  Sparkles,
} from "lucide-react";

import { useAuth } from "../context/AuthContext";

import "../headerLuxe.css";

export default function Header({ cantidadCarrito = 0 }) {
  const navigate = useNavigate();

  const [menuAbierto, setMenuAbierto] = useState(false);
  const [errorSalida, setErrorSalida] = useState("");

  const {
    usuario,
    autenticado,
    verificandoSesion,
    esAdmin,
    cerrarSesion,
  } = useAuth();

  function cerrarMenu() {
    setMenuAbierto(false);
  }

  async function salir() {
    setErrorSalida("");
    cerrarMenu();

    try {
      await cerrarSesion();
    } catch {
      setErrorSalida(
        "No se pudo confirmar la revocación de la sesión " +
        "en el servidor. Verifica tu conexión."
      );
    }

    navigate("/", { replace: true });
  }

  const enlaces = [
    { nombre: "Inicio", ruta: "/", exacto: true },
    { nombre: "Catálogo", ruta: "/catalogo" },
    {
      nombre: "Anillos",
      ruta: "/catalogo?categoria=Anillos",
    },
    {
      nombre: "Collares",
      ruta: "/catalogo?categoria=Collares",
    },
    {
      nombre: "Aretes",
      ruta: "/catalogo?categoria=Aretes",
    },
    {
      nombre: "Pulseras",
      ruta: "/catalogo?categoria=Pulseras",
    },
  ];

  return (
    <>
      {/* BARRA SUPERIOR */}

      <div className="announcement nl-announcement">
        <Sparkles size={13} />
        <span>
          NALÚ LUXE · JOYAS QUE RESALTAN TU ESENCIA
        </span>
        <Sparkles size={13} />
      </div>

      {/* ENCABEZADO */}

      <header className="site-header nl-header">
        <div className="container nl-header-content">
          {/* LOGO ORIGINAL */}

          <Link
            to="/"
            className="brand nl-header-brand"
            onClick={cerrarMenu}
            aria-label="NALÚ LUXE - Inicio"
          >
            <span className="brand-symbol">
              <Gem size={25} strokeWidth={1.5} />
            </span>

            <span>
              NALÚ <strong>LUXE</strong>
              <small>JEWELRY COLLECTION</small>
            </span>
          </Link>

          {/* NAVEGACIÓN PRINCIPAL */}

          <nav
            className={
              menuAbierto
                ? "nl-header-nav nl-header-nav-open"
                : "nl-header-nav"
            }
            aria-label="Navegación principal"
          >
            <div className="nl-header-nav-links">
              {enlaces.map((enlace) => (
                <NavLink
                  key={enlace.ruta}
                  to={enlace.ruta}
                  end={enlace.exacto}
                  onClick={cerrarMenu}
                  className={({ isActive }) => {
                    const categoria =
                      enlace.ruta.includes("?categoria=");

                    return (
                      "nl-header-nav-link" +
                      (isActive && !categoria
                        ? " nl-header-link-active"
                        : "")
                    );
                  }}
                >
                  {enlace.nombre}
                </NavLink>
              ))}
            </div>

            {/* ACCESOS DE AUTENTICACIÓN */}

            <div className="nl-header-auth">
              {!verificandoSesion && !autenticado && (
                <>
                  <NavLink
                    to="/login"
                    onClick={cerrarMenu}
                    className="nl-header-login"
                  >
                    Iniciar sesión
                  </NavLink>

                  <NavLink
                    to="/registro"
                    onClick={cerrarMenu}
                    className="nl-header-register"
                  >
                    Registrarme
                    <ArrowUpRight size={15} />
                  </NavLink>
                </>
              )}

              {!verificandoSesion && autenticado && (
                <>
                  {esAdmin && (
                    <NavLink
                      to="/admin"
                      onClick={cerrarMenu}
                      className="nl-header-admin"
                    >
                      <ShieldCheck size={16} />
                      Administración
                    </NavLink>
                  )}

                  <NavLink
                    to="/mi-cuenta"
                    onClick={cerrarMenu}
                    className="nl-header-account"
                  >
                    <UserRound size={16} />
                    Mi cuenta
                  </NavLink>

                  <button
                    type="button"
                    className="nl-header-logout"
                    onClick={salir}
                  >
                    <LogOut size={16} />
                    Cerrar sesión
                  </button>
                </>
              )}
            </div>
          </nav>

          {/* CARRITO Y CUENTA */}

          <div className="nl-header-actions">
            <Link
              to="/carrito"
              className="nl-header-icon-button nl-header-cart"
              onClick={cerrarMenu}
              aria-label={
                `Carrito de compras con ` +
                `${cantidadCarrito} productos`
              }
              title="Mi carrito de compras"
            >
              <ShoppingCart
                size={25}
                strokeWidth={1.8}
              />

              {cantidadCarrito > 0 && (
                <span className="nl-header-cart-count">
                  {cantidadCarrito > 99
                    ? "99+"
                    : cantidadCarrito}
                </span>
              )}
            </Link>

            {!verificandoSesion && (
              <Link
                to={
                  autenticado
                    ? "/mi-cuenta"
                    : "/login"
                }
                className="nl-header-icon-button nl-header-profile"
                title={
                  autenticado
                    ? `Cuenta de ${usuario?.nombre || "usuario"}`
                    : "Iniciar sesión"
                }
                aria-label="Acceder a mi cuenta"
                onClick={cerrarMenu}
              >
                {esAdmin ? (
                  <ShieldCheck
                    size={24}
                    strokeWidth={1.8}
                  />
                ) : (
                  <UserRound
                    size={24}
                    strokeWidth={1.8}
                  />
                )}
              </Link>
            )}

            <button
              type="button"
              className="nl-header-mobile-toggle"
              aria-label={
                menuAbierto
                  ? "Cerrar menú"
                  : "Abrir menú"
              }
              aria-expanded={menuAbierto}
              onClick={() =>
                setMenuAbierto((actual) => !actual)
              }
            >
              {menuAbierto ? (
                <X size={25} />
              ) : (
                <Menu size={25} />
              )}
            </button>
          </div>
        </div>
      </header>

      {errorSalida && (
        <div
          className="container auth-alert auth-alert-error"
          role="alert"
        >
          {errorSalida}
        </div>
      )}
    </>
  );
}
