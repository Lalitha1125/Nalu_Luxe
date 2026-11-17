
import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const archivoActual = fileURLToPath(import.meta.url);
const carpetaScripts = path.dirname(archivoActual);

const frontend = path.resolve(carpetaScripts, "..");
const proyecto = path.resolve(frontend, "..");

const carpetaImagenes = path.join(
  frontend,
  "public",
  "joyas"
);

const carpetaCatalogo = path.join(
  carpetaImagenes,
  "catalogo"
);

const carpetaBaseDatos = path.join(
  proyecto,
  "database"
);

const categorias = [
  {
    carpeta: "anillos",
    prefijo: "anillo",
    sku: "ANI",
  },
  {
    carpeta: "aretes",
    prefijo: "arete",
    sku: "ARE",
  },
  {
    carpeta: "collares",
    prefijo: "collar",
    sku: "COL",
  },
  {
    carpeta: "pulseras",
    prefijo: "pulsera",
    sku: "PUL",
  },
];

const extensiones = new Set([
  ".png",
  ".jpg",
  ".jpeg",
  ".webp",
]);

function numero(numero) {
  return String(numero).padStart(2, "0");
}

function escaparSQL(texto) {
  return String(texto)
    .replaceAll("\\", "\\\\")
    .replaceAll("'", "''");
}

function obtenerNombreProducto(nombreArchivo) {
  const nombreSinExtension = path.parse(nombreArchivo).name;

  // Los archivos con nombre automático no permiten
  // identificar qué joya aparece realmente.
  if (/^Imagen de ChatGPT/i.test(nombreSinExtension)) {
    return null;
  }

  const nombreLimpio = nombreSinExtension
    .replace(/-\d+$/, "")
    .replace(/\s+sobre\s+.*$/i, "")
    .replace(/\s+en\s+fondo\s+.*$/i, "")
    .replace(/\s+en\s+terciopelo\s+.*$/i, "")
    .trim();

  if (nombreLimpio.length < 5) {
    return null;
  }

  // Evitar títulos demasiado largos.
  return nombreLimpio.slice(0, 150);
}

function esNombreAutomatico(nombre) {
  return /^Imagen de ChatGPT/i.test(nombre);
}

async function ejecutar() {
  await fs.mkdir(carpetaCatalogo, {
    recursive: true,
  });

  await fs.mkdir(carpetaBaseDatos, {
    recursive: true,
  });

  const instrucciones = [
    "USE nalu_luxe;",
    "",
    "START TRANSACTION;",
    "",
    "-- Fotografías reales de NALU LUXE",
    "-- Las imágenes originales no se modifican.",
    "",
  ];

  const reporte = [
    "NALU LUXE - ASIGNACIÓN DE FOTOGRAFÍAS",
    "===================================",
    "",
  ];

  let totalAsignadas = 0;

  for (const categoria of categorias) {
    const origen = path.join(
      carpetaImagenes,
      categoria.carpeta
    );

    const destino = path.join(
      carpetaCatalogo,
      categoria.carpeta
    );

    await fs.mkdir(origen, {
      recursive: true,
    });

    await fs.mkdir(destino, {
      recursive: true,
    });

    const archivos = await fs.readdir(origen, {
      withFileTypes: true,
    });

    const imagenes = archivos
      .filter((archivo) => archivo.isFile())
      .map((archivo) => archivo.name)
      .filter((nombre) =>
        extensiones.has(
          path.extname(nombre).toLowerCase()
        )
      )
      .sort((a, b) => {
        // Preferimos nombres descriptivos.
        const prioridadA = esNombreAutomatico(a) ? 1 : 0;
        const prioridadB = esNombreAutomatico(b) ? 1 : 0;

        if (prioridadA !== prioridadB) {
          return prioridadA - prioridadB;
        }

        return a.localeCompare(b, "es", {
          numeric: true,
        });
      });

    const seleccionadas = imagenes.slice(0, 10);

    reporte.push(
      `\n${categoria.carpeta.toUpperCase()}`,
      `Encontradas: ${imagenes.length}`,
      `Asignadas: ${seleccionadas.length}`,
      ""
    );

    for (let i = 0; i < 10; i++) {
      const sku = `${categoria.sku}-${String(i + 1).padStart(3, "0")}`;
      const imagenOriginal = seleccionadas[i];

      if (!imagenOriginal) {
        reporte.push(
          `${sku} -> SIN FOTOGRAFÍA`
        );

        // Solo retirar las rutas provisionales WEBP.
        // No borrar una imagen PNG previamente asignada.
        instrucciones.push(
          `UPDATE productos`,
          `SET imagen_principal = NULL`,
          `WHERE sku = '${sku}'`,
          `AND (imagen_principal IS NULL`,
          `     OR imagen_principal LIKE '%.webp');`,
          ""
        );

        continue;
      }

      const extension = path
        .extname(imagenOriginal)
        .toLowerCase();

      const nombreNuevo =
        `${categoria.prefijo}-${numero(i + 1)}${extension}`;

      const origenImagen = path.join(
        origen,
        imagenOriginal
      );

      const destinoImagen = path.join(
        destino,
        nombreNuevo
      );

      await fs.copyFile(
        origenImagen,
        destinoImagen
      );

      const rutaWeb =
        `/joyas/catalogo/${categoria.carpeta}/${nombreNuevo}`;

      const nombreProducto =
        obtenerNombreProducto(imagenOriginal);

      reporte.push(
        `${sku} -> ${imagenOriginal}`,
        `Imagen web: ${rutaWeb}`,
        `Nombre: ${nombreProducto || "(conservar nombre actual)"}`,
        ""
      );

      // Actualizar imagen y, cuando sea identificable,
      // ajustar el nombre del producto.
      const campos = [
        `imagen_principal = '${escaparSQL(rutaWeb)}'`,
      ];

      if (nombreProducto) {
        campos.push(
          `nombre = '${escaparSQL(nombreProducto)}'`
        );
      }

      instrucciones.push(
        "UPDATE productos",
        `SET ${campos.join(", ")}`,
        `WHERE sku = '${sku}';`,
        ""
      );

      totalAsignadas++;
    }

    if (imagenes.length > 10) {
      reporte.push(
        "IMÁGENES CONSERVADAS SIN ASIGNAR:"
      );

      imagenes.slice(10).forEach((nombre) => {
        reporte.push(`- ${nombre}`);
      });
    }
  }

  instrucciones.push(
    "COMMIT;",
    ""
  );

  const archivoSQL = path.join(
    carpetaBaseDatos,
    "003_fotografias.sql"
  );

  const archivoReporte = path.join(
    carpetaBaseDatos,
    "003_reporte_fotos.txt"
  );

  await fs.writeFile(
    archivoSQL,
    instrucciones.join("\n"),
    "utf8"
  );

  await fs.writeFile(
    archivoReporte,
    reporte.join("\n"),
    "utf8"
  );

  console.log("\nNALU LUXE");
  console.log("==========================");
  console.log(`Fotografías asignadas: ${totalAsignadas}/40`);
  console.log(`Pendientes: ${40 - totalAsignadas}`);
  console.log("\nArchivos generados:");
  console.log(archivoSQL);
  console.log(archivoReporte);
  console.log("\nNo se modificó MySQL todavía.");
}

ejecutar().catch((error) => {
  console.error(
    "Error al preparar el catálogo:",
    error.message
  );

  process.exitCode = 1;
});
