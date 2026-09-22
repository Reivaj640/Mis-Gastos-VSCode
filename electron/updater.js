const { app, ipcMain } = require("electron");
const { autoUpdater } = require("electron-updater");

const CHECK_INTERVAL_MS = 4 * 60 * 60 * 1000; // 4 horas

function send(win, channel, payload) {
  if (win && !win.isDestroyed()) {
    win.webContents.send(channel, payload);
  }
}

async function doCheck(win) {
  send(win, "update:checking");
  try {
    await autoUpdater.checkForUpdates();
  } catch (err) {
    send(win, "update:error", String(err && err.message ? err.message : err));
  }
}

function startUpdater(win) {
  autoUpdater.autoDownload = true;
  autoUpdater.autoInstallOnAppQuit = true;

  autoUpdater.on("update-available", () => {
    send(win, "update:available");
  });

  autoUpdater.on("update-not-available", () => {
    send(win, "update:current");
  });

  autoUpdater.on("download-progress", (progress) => {
    send(win, "update:progress", {
      percent: progress.percent,
      transferred: progress.transferred,
      total: progress.total,
    });
  });

  autoUpdater.on("update-downloaded", (info) => {
    send(win, "update:downloaded", info && info.version ? info.version : "");
  });

  autoUpdater.on("error", (err) => {
    send(win, "update:error", String(err && err.message ? err.message : err));
  });

  ipcMain.handle("update:check", () => doCheck(win));
  ipcMain.handle("app:version", () => app.getVersion());
  ipcMain.on("update:install", () => {
    autoUpdater.quitAndInstall(false, true);
  });

  // Chequeo inicial (con pequeño delay para no competir con el arranque)
  setTimeout(() => doCheck(win), 3000);

  // Chequeo periódico
  setInterval(() => doCheck(win), CHECK_INTERVAL_MS);
}

module.exports = { startUpdater };
