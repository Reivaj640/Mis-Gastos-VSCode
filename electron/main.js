const { app, BrowserWindow } = require("electron");
const path = require("path");
const http = require("http");
const fs = require("fs");
const { startUpdater } = require("./updater");

const OUT_DIR = path.join(__dirname, "..", "out");

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
  ".wasm": "application/wasm",
};

let mainWindow = null;
let server = null;

function startStaticServer() {
  return new Promise((resolve, reject) => {
    server = http.createServer((req, res) => {
      try {
        const urlPath = decodeURIComponent((req.url || "/").split("?")[0]);
        let filePath = path.normalize(path.join(OUT_DIR, urlPath));

        if (!filePath.startsWith(OUT_DIR)) {
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

    server.on("error", reject);
    server.listen(0, "127.0.0.1", () => {
      resolve(server.address().port);
    });
  });
}

function createWindow(port) {
  mainWindow = new BrowserWindow({
    width: 1440,
    height: 900,
    minWidth: 360,
    minHeight: 500,
    show: false,
    backgroundColor: "#0f172a",
    title: "Mis Gastos",
    webPreferences: {
      preload: path.join(__dirname, "preload.js"),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: false,
    },
  });

  mainWindow.once("ready-to-show", () => mainWindow.show());
  mainWindow.loadURL(`http://127.0.0.1:${port}/`);

  mainWindow.on("closed", () => {
    mainWindow = null;
  });

  startUpdater(mainWindow);
}

const gotLock = app.requestSingleInstanceLock();
if (!gotLock) {
  app.quit();
} else {
  app.on("second-instance", () => {
    if (mainWindow) {
      if (mainWindow.isMinimized()) mainWindow.restore();
      mainWindow.focus();
    }
  });

  app.whenReady().then(async () => {
    try {
      const port = await startStaticServer();
      createWindow(port);
    } catch (err) {
      console.error("Error starting app:", err);
      app.quit();
    }
  });

  app.on("window-all-closed", () => {
    if (process.platform !== "darwin") app.quit();
  });

  app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0 && server) {
      const address = server.address();
      createWindow(typeof address === "object" && address ? address.port : 0);
    }
  });

  app.on("before-quit", () => {
    if (server) {
      server.close();
      server = null;
    }
  });
}
