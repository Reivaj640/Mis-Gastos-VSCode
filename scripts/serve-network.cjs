/**
 * Servidor local de Mis Gastos para ver la app en otros equipos de la red.
 *
 * POR QUÉ EXISTE ESTE ARCHIVO:
 * El comando de desarrollo (npm run dev) NO sirve para abrir la app en
 * otros equipos. Necesita 6,7 MB de código y mantiene una conexión de
 * recarga automática que se corta en redes locales, dejando la pantalla
 * congelada en "Cargando Mis Gastos".
 *
 * Este script sirve la versión ya compilada (carpeta out/), que pesa
 * 1,3 MB y no usa esa conexión. Es la misma versión que se publicaría.
 *
 * USO:
 *   1. Compila la app:      npm run build
 *   2. Abre en la red:      npm run preview:network
 *
 * La dirección exacta para los demás equipos se muestra en pantalla.
 */

const http = require("http");
const fs = require("fs");
const os = require("os");
const path = require("path");

const OUT_DIR = path.join(__dirname, "..", "out");
const PORT = Number(process.env.PORT) || 4000;

const MIME_TYPES = {
  ".html": "text/html; charset=utf-8",
  ".js": "application/javascript; charset=utf-8",
  ".mjs": "application/javascript; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".txt": "text/plain; charset=utf-8",
  ".svg": "image/svg+xml",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".gif": "image/gif",
  ".ico": "image/x-icon",
  ".woff": "font/woff",
  ".woff2": "font/woff2",
  ".ttf": "font/ttf",
  ".map": "application/json",
  ".webmanifest": "application/manifest+json",
};

if (!fs.existsSync(path.join(OUT_DIR, "index.html"))) {
  console.error("");
  console.error("  No se encontro la version compilada de la app.");
  console.error("  Primero ejecuta:  npm run build");
  console.error("");
  process.exit(1);
}

function getLocalAddress() {
  const nets = os.networkInterfaces();
  for (const name of Object.keys(nets)) {
    for (const net of nets[name] || []) {
      if (net.family === "IPv4" && !net.internal) return net.address;
    }
  }
  return "localhost";
}

const server = http.createServer((req, res) => {
  try {
    const urlPath = decodeURIComponent((req.url || "/").split("?")[0]);
    let filePath = path.normalize(path.join(OUT_DIR, urlPath));

    if (!filePath.startsWith(path.normalize(OUT_DIR))) {
      res.writeHead(403);
      res.end("Forbidden");
      return;
    }

    if (fs.existsSync(filePath) && fs.statSync(filePath).isDirectory()) {
      filePath = path.join(filePath, "index.html");
    }

    if (!fs.existsSync(filePath)) {
      const notFound = path.join(OUT_DIR, "404.html");
      if (fs.existsSync(notFound)) {
        filePath = notFound;
      } else {
        res.writeHead(404);
        res.end("Not Found");
        return;
      }
    }

    const ext = path.extname(filePath).toLowerCase();
    const contentType = MIME_TYPES[ext] || "application/octet-stream";
    res.writeHead(200, { "Content-Type": contentType, "Cache-Control": "no-cache" });
    fs.createReadStream(filePath).pipe(res);
  } catch (err) {
    res.writeHead(500);
    res.end("Internal Server Error");
  }
});

server.on("error", (err) => {
  if (err.code === "EADDRINUSE") {
    console.error("");
    console.error(`  El puerto ${PORT} ya esta ocupado.`);
    console.error(`  Cierra lo que lo este usando o ejecuta:  set PORT=4001 && npm run preview:network`);
    console.error("");
  } else {
    console.error("  Error al iniciar el servidor:", err.message);
  }
  process.exit(1);
});

server.listen(PORT, "0.0.0.0", () => {
  const ip = getLocalAddress();
  console.log("");
  console.log("  Mis Gastos esta disponible en:");
  console.log("");
  console.log(`    En este equipo:  http://localhost:${PORT}`);
  console.log(`    En otros equipos: http://${ip}:${PORT}`);
  console.log("");
  console.log("  Para detenerlo, cierra esta ventana o presiona Ctrl + C.");
  console.log("");
});
