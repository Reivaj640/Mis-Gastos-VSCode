const fs = require("fs");
const path = require("path");

const OUT_DIR = path.resolve(__dirname, "..", "out");
const VERSION_FILE = path.resolve(__dirname, "..", "src", "lib", "version.ts");

const EXCLUDE_PATTERNS = [
  /\.txt$/,
  /\.map$/,
  /_clientMiddlewareManifest\.json$/,
  /^404\.html$/,
  /^_not-found(\.html|\/)?/,
  /^INICIA\.bat$/i,
];

function parseArgs(argv) {
  const args = { version: null, notes: "", out: null };
  for (const arg of argv.slice(2)) {
    if (arg.startsWith("--version=")) args.version = arg.split("=")[1];
    else if (arg.startsWith("--notes=")) args.notes = arg.split("=").slice(1).join("=");
    else if (arg.startsWith("--out=")) args.out = path.resolve(arg.split("=").slice(1).join("="));
  }
  return args;
}

function readAppVersion() {
  const content = fs.readFileSync(VERSION_FILE, "utf-8");
  const match = content.match(/APP_VERSION\s*=\s*"([^"]+)"/);
  if (!match) throw new Error("No se encontró APP_VERSION en " + VERSION_FILE);
  return match[1];
}

function isExcluded(relPath) {
  const base = path.basename(relPath);
  return EXCLUDE_PATTERNS.some((pat) => pat.test(relPath) || pat.test(base));
}

function collectFiles(dir, base) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  let files = [];
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    const relPath = path.relative(base, fullPath).replace(/\\/g, "/");
    if (entry.isDirectory()) {
      files = files.concat(collectFiles(fullPath, base));
    } else {
      if (!isExcluded(relPath)) {
        files.push({ path: relPath, fullPath });
      }
    }
  }
  return files;
}

function main() {
  const args = parseArgs(process.argv);

  if (!fs.existsSync(OUT_DIR)) {
    console.error("Error: No existe la carpeta 'out/'. Ejecuta 'npm run build' primero.");
    process.exit(1);
  }

  const version = args.version || readAppVersion();
  const releaseNotes = args.notes || `Actualización v${version}`;

  console.log(`Generando UpdateManifest v${version}...`);
  console.log(`Carpeta fuente: ${OUT_DIR}`);

  const rawFiles = collectFiles(OUT_DIR, OUT_DIR);
  console.log(`Archivos encontrados: ${rawFiles.length}`);

  // Copy sw.js from public/ to out/ and prioritize it
  const swSrc = path.resolve(__dirname, "..", "public", "sw.js");
  const swDest = path.resolve(OUT_DIR, "sw.js");
  if (fs.existsSync(swSrc)) {
    fs.copyFileSync(swSrc, swDest);
    console.log("sw.js copiado de public/ a out/");
  }

  // Prioritize sw.js as first file in manifest
  const swIndex = rawFiles.findIndex((f) => f.path === "sw.js");
  if (swIndex > 0) {
    const [swFile] = rawFiles.splice(swIndex, 1);
    rawFiles.unshift(swFile);
  }
  if (swIndex === 0) {
    console.log("sw.js priorizado como primer archivo del manifest");
  }

  const files = rawFiles.map((f) => {
    const buf = fs.readFileSync(f.fullPath);
    return {
      path: f.path.startsWith("/") ? f.path.slice(1) : f.path,
      content: buf.toString("base64"),
    };
  });

  const manifest = {
    version,
    releaseDate: new Date().toISOString().split("T")[0],
    releaseNotes,
    files,
  };

  const outPath = args.out || path.resolve(__dirname, "..", "update-manifest.json");
  fs.writeFileSync(outPath, JSON.stringify(manifest, null, 2));

  const sizeMB = (fs.statSync(outPath).size / 1024 / 1024).toFixed(2);
  console.log(`\nManifest generado: ${outPath}`);
  console.log(`Versión: ${version}`);
  console.log(`Archivos incluidos: ${files.length}`);
  console.log(`Tamaño: ${sizeMB} MB`);
  console.log(`\nDistribuye este archivo .json al usuario para que lo importe en Configuración → Actualización.`);
}

main();
