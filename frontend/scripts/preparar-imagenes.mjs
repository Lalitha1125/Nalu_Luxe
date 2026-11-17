
import sharp from "sharp";
import fs from "node:fs/promises";
import path from "node:path";

const raiz = process.cwd();

const origenBase = path.join(
  raiz,
  "assets",
  "joyas"
);

const destinoBase = path.join(
  raiz,
  "public",
  "joyas"
);

const categorias = [
  { carpeta: "anillos", prefijo: "anillo" },
  { carpeta: "aretes", prefijo: "arete" },
  { carpeta: "collares", prefijo: "collar" },
  { carpeta: "pulseras", prefijo: "pulsera" },
];

const extensiones = [".jpg", ".jpeg", ".png", ".webp"];

let convertidas = 0;
const faltantes = [];

for (const categoria of categorias) {
  const carpetaOrigen = path.join(
    origenBase,
    categoria.carpeta
  );

  const carpetaDestino = path.join(
    destinoBase,
    categoria.carpeta
  );

  await fs.mkdir(carpetaOrigen, { recursive: true });
  await fs.mkdir(carpetaDestino, { recursive: true });

  for (let numero = 1; numero <= 10; numero++) {
    const nombre = `${categoria.prefijo}-${String(
      numero
    ).padStart(2, "0")}`;

    let archivoEncontrado = null;

    for (const extension of extensiones) {
      const candidato = path.join(
        carpetaOrigen,
        nombre + extension
      );

      try {
        await fs.access(candidato);
        archivoEncontrado = candidato;
        break;
      } catch {
        // Continuar buscando otra extensión.
      }
    }

    if (!archivoEncontrado) {
      faltantes.push(
        `${categoria.carpeta}/${nombre}`
      );

      continue;
    }

    const destino = path.join(
      carpetaDestino,
      nombre + ".webp"
    );

    try {
      await sharp(archivoEncontrado)
        .rotate()
        .resize(900, 900, {
          fit: "contain",
          background: "#fff5f7",
          withoutEnlargement: true,
        })
        .webp({
          quality: 85,
          effort: 5,
        })
        .toFile(destino);

      convertidas++;

      console.log(`OK: ${categoria.carpeta}/${nombre}.webp`);
    } catch (error) {
      console.error(
        `Error procesando ${nombre}: ${error.message}`
      );
    }
  }
}

console.log("\n========== NALU LUXE ==========");
console.log(`Imágenes convertidas: ${convertidas}/40`);

if (faltantes.length) {
  console.log("\nFotografías pendientes:");
  faltantes.forEach((archivo) =>
    console.log(`- ${archivo}`)
  );
} else {
  console.log("\n¡Catálogo fotográfico completo!");
}
