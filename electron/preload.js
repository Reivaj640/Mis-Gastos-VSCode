const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("electronAPI", {
  isElectron: true,
  getAppVersion: () => ipcRenderer.invoke("app:version"),
  checkForUpdates: () => ipcRenderer.invoke("update:check"),
  installUpdate: () => ipcRenderer.send("update:install"),
  onUpdateAvailable: (callback) => {
    ipcRenderer.on("update:available", () => callback());
  },
  onDownloadProgress: (callback) => {
    ipcRenderer.on("update:progress", (_event, progress) => callback(progress));
  },
  onUpdateDownloaded: (callback) => {
    ipcRenderer.on("update:downloaded", (_event, version) => callback(version));
  },
  onUpdateError: (callback) => {
    ipcRenderer.on("update:error", (_event, message) => callback(message));
  },
  onChecking: (callback) => {
    ipcRenderer.on("update:checking", () => callback());
  },
  onNoUpdate: (callback) => {
    ipcRenderer.on("update:current", () => callback());
  },
});
