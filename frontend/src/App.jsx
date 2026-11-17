
import { useEffect, useState } from "react";

import {
  Routes,
  Route,
  Navigate,
  Link,
  useNavigate,
} from "react-router-dom";

import Header from "./components/Header";
import Footer from "./components/Footer";

import Home from "./pages/Home";
import Catalogo from "./pages/Catalogo";
import ProductoDetalle from "./pages/ProductoDetalle";
import Carrito from "./pages/Carrito";

import Registro from "./pages/Registro";
import VerificarCorreo from "./pages/VerificarCorreo";
import Login from "./pages/Login";
import VerificarLogin from "./pages/VerificarLogin";
import RecuperarClave from "./pages/RecuperarClave";
import RestablecerClave from "./pages/RestablecerClave";

import MiCuenta from "./pages/MiCuenta";
import MisDirecciones from "./pages/MisDirecciones";
import FinalizarCompra from "./pages/FinalizarCompra";
import MisPedidos from "./pages/MisPedidos";

import AdminPanel from "./pages/AdminPanel";
import Contacto from "./pages/Contacto";
import AdminConsultas from "./pages/AdminConsultas";
import InvitacionesAdmin from "./pages/InvitacionesAdmin";

import { catalogoService } from "./services/catalogoService";
import { useAuth } from "./context/AuthContext";

import "./invitaciones.css";

const CLAVE_CARRITO = "nalu_luxe_carrito";

function recuperarCarrito() {
  try {
    const datos = JSON.parse(
      localStorage.getItem(CLAVE_CARRITO) || "[]"
    );

    return Array.isArray(datos) ? datos : [];
  } catch {
    return [];
  }
}

function RutaProtegida({
  children,
  soloAdmin = false,
}) {
  const {
    autenticado,
    esAdmin,
    verificandoSesion,
  } = useAuth();

  if (verificandoSesion) {
    return (
      <main className="container section">
        <p>Comprobando tu sesión...</p>
      </main>
    );
  }

  if (!autenticado) {
    return <Navigate to="/login" replace />;
  }

  if (soloAdmin && !esAdmin) {
    return <Navigate to="/catalogo" replace />;
  }

  return children;
}

export default function App() {
  const navigate = useNavigate();
  const { esAdmin } = useAuth();

  const [productos, setProductos] = useState([]);
  const [categorias, setCategorias] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState("");

  const [carrito, setCarrito] = useState(
    recuperarCarrito
  );

  useEffect(() => {
    let activo = true;

    async function cargarCatalogo() {
      setCargando(true);
      setError("");

      try {
        const [
          datosProductos,
          datosCategorias,
        ] = await Promise.all([
          catalogoService.obtenerProductos(),
          catalogoService.obtenerCategorias(),
        ]);

        if (!activo) return;

        setProductos(datosProductos);
        setCategorias(datosCategorias);
      } catch (err) {
        if (activo) setError(err.message);
      } finally {
        if (activo) setCargando(false);
      }
    }

    cargarCatalogo();

    return () => {
      activo = false;
    };
  }, []);

  useEffect(() => {
    localStorage.setItem(
      CLAVE_CARRITO,
      JSON.stringify(carrito)
    );
  }, [carrito]);

  function agregarAlCarrito(
    producto,
    cantidad = 1
  ) {
    const stock = Number(producto.stock);

    if (stock <= 0 || cantidad <= 0) {
      return;
    }

    setCarrito((anterior) => {
      const existente = anterior.find(
        (item) => item.id === producto.id
      );

      if (existente) {
        return anterior.map((item) =>
          item.id === producto.id
            ? {
                ...item,
                cantidad: Math.min(
                  stock,
                  item.cantidad + cantidad
                ),
                precio: producto.precio,
              }
            : item
        );
      }

      return [
        ...anterior,
        {
          id: producto.id,
          nombre: producto.nombre,
          precio: producto.precio,
          imagenPrincipal: producto.imagenPrincipal,
          categoria: producto.categoria,
          cantidad: Math.min(cantidad, stock),
        },
      ];
    });

    navigate("/carrito");
  }

  function quitarProducto(id) {
    setCarrito((anterior) =>
      anterior.filter((item) => item.id !== id)
    );
  }

  function actualizarCantidad(id, cantidad) {
    if (cantidad <= 0) {
      quitarProducto(id);
      return;
    }

    setCarrito((anterior) =>
      anterior.map((item) => {
        if (item.id !== id) return item;

        const producto = productos.find(
          (p) => p.id === id
        );

        const stock = Number(
          producto?.stock ?? 0
        );

        return {
          ...item,
          cantidad: Math.min(
            cantidad,
            Math.max(stock, 1)
          ),
        };
      })
    );
  }

  function vaciarCarrito() {
    setCarrito([]);
  }

  const cantidadCarrito = carrito.reduce(
    (total, item) => total + item.cantidad,
    0
  );

  return (
    <div className="app">
      <Header cantidadCarrito={cantidadCarrito} />

      <Routes>
        <Route
          path="/"
          element={
            <Home
              productos={productos}
              cargando={cargando}
              error={error}
              agregarAlCarrito={agregarAlCarrito}
            />
          }
        />

        <Route
          path="/catalogo"
          element={
            <Catalogo
              productos={productos}
              categorias={categorias}
              cargando={cargando}
              error={error}
              agregarAlCarrito={agregarAlCarrito}
            />
          }
        />

        <Route
          path="/producto/:id"
          element={
            <ProductoDetalle
              productos={productos}
              cargando={cargando}
              agregarAlCarrito={agregarAlCarrito}
            />
          }
        />

        <Route
          path="/carrito"
          element={
            <Carrito
              carrito={carrito}
              productos={productos}
              actualizarCantidad={actualizarCantidad}
              quitarProducto={quitarProducto}
            />
          }
        />

        <Route
          path="/registro"
          element={<Registro />}
        />

        <Route
          path="/verificar-correo"
          element={<VerificarCorreo />}
        />

        <Route
          path="/login"
          element={<Login />}
        />

        <Route
          path="/verificar-login"
          element={<VerificarLogin />}
        />

        <Route
          path="/recuperar-clave"
          element={<RecuperarClave />}
        />

        <Route
          path="/restablecer-clave"
          element={<RestablecerClave />}
        />

        <Route
          path="/mi-cuenta"
          element={
            <RutaProtegida>
              <>
                <MiCuenta />

                {!esAdmin && (
                  <div className="container section">
                    <div className="nalu-account-card">
                      <h2>Invitación administrativa</h2>
                      <p>
                        Si recibiste una invitación
                        oficial del equipo NALÚ LUXE,
                        puedes activarla desde aquí.
                      </p>

                      <Link
                        to="/activar-administrador"
                        className="btn btn-primary"
                      >
                        Activar invitación
                      </Link>
                    </div>
                  </div>
                )}
              </>
            </RutaProtegida>
          }
        />

        <Route
          path="/mis-direcciones"
          element={
            <RutaProtegida>
              <MisDirecciones />
            </RutaProtegida>
          }
        />

        <Route
          path="/finalizar-compra"
          element={
            <RutaProtegida>
              <FinalizarCompra
                carrito={carrito}
                vaciarCarrito={vaciarCarrito}
              />
            </RutaProtegida>
          }
        />

        <Route
          path="/mis-pedidos"
          element={
            <RutaProtegida>
              <MisPedidos />
            </RutaProtegida>
          }
        />

        <Route
          path="/contacto"
          element={<Contacto />}
        />

        <Route
          path="/admin"
          element={
            <RutaProtegida soloAdmin>
              <>
                <AdminPanel />

                <div className="container section">
                  <div className="nalu-account-card">
                    <h2>Herramientas del equipo</h2>

                    <p>
                      Administra las consultas
                      y las invitaciones del negocio.
                    </p>

                    <div className="addresses-form-actions">
                      <Link
                        to="/admin/consultas"
                        className="btn btn-outline"
                      >
                        Consultas de clientes
                      </Link>

                      <Link
                        to="/admin/invitaciones"
                        className="btn btn-primary"
                      >
                        Invitar administradores
                      </Link>
                    </div>
                  </div>
                </div>
              </>
            </RutaProtegida>
          }
        />

        <Route
          path="/admin/consultas"
          element={
            <RutaProtegida soloAdmin>
              <AdminConsultas />
            </RutaProtegida>
          }
        />

        <Route
          path="/admin/invitaciones"
          element={
            <RutaProtegida soloAdmin>
              <InvitacionesAdmin />
            </RutaProtegida>
          }
        />

        <Route
          path="/activar-administrador"
          element={
            <RutaProtegida>
              <InvitacionesAdmin />
            </RutaProtegida>
          }
        />

        <Route
          path="*"
          element={<Navigate to="/" replace />}
        />
      </Routes>

      <Footer />
    </div>
  );
}
