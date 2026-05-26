import { APP_VERSION, compareVersions, type UpdateManifest } from "./version";

// ---- IndexedDB for persistent version storage ----
const DB_NAME = "mis-gastos-updater";
const DB_VERSION = 2;
const STORE_NAME = "updates";

function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);
    request.onupgradeneeded = (e) => {
      const db = (e.target as IDBOpenDBRequest).result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: "key" });
      }
    };
    request.onsuccess = (e) => resolve((e.target as IDBOpenDBRequest).result);
    request.onerror = (e) => reject((e.target as IDBOpenDBRequest).error);
  });
}

function dbGet(key: string): Promise<any> {
  return openDB().then(
    (db) =>
      new Promise((resolve, reject) => {
        const tx = db.transaction(STORE_NAME, "readonly");
        const req = tx.objectStore(STORE_NAME).get(key);
        req.onsuccess = () => {
          if (req.result) {
            resolve(req.result.value !== undefined ? req.result.value : req.result);
          } else {
            resolve(null);
          }
        };
        req.onerror = () => reject(req.error);
      })
  );
}

function dbSet(key: string, value: any): Promise<void> {
  return openDB().then(
    (db) =>
      new Promise((resolve, reject) => {
        const tx = db.transaction(STORE_NAME, "readwrite");
        tx.objectStore(STORE_NAME).put({ key, value });
        tx.oncomplete = () => resolve();
        tx.onerror = () => reject(tx.error);
      })
  );
}

// ---- Version info ----
export async function getCurrentVersion(): Promise<string> {
  return (await dbGet("currentVersion")) || APP_VERSION;
}

export async function setCurrentVersion(version: string): Promise<void> {
  await dbSet("currentVersion", version);
}

// ---- Service Worker helpers ----
function getSW(): ServiceWorker | null {
  return navigator.serviceWorker?.controller || null;
}

function sendToSW(message: any): Promise<any> {
  return new Promise((resolve, reject) => {
    const sw = getSW();
    if (!sw) {
      reject(new Error("Service Worker no activo"));
      return;
    }
    const handler = (event: MessageEvent) => {
      if (event.data?.type === message.type + "_RESPONSE" || event.data?.type === message.type.replace("REQ_", "")) {
        navigator.serviceWorker.removeEventListener("message", handler);
        resolve(event.data.data);
      }
    };
    navigator.serviceWorker.addEventListener("message", handler);
    sw.postMessage(message);
    // Timeout after 5s
    setTimeout(() => {
      navigator.serviceWorker.removeEventListener("message", handler);
      resolve(null);
    }, 5000);
  });
}

// ---- File storage in Cache API ----
function getContentType(path: string): string {
  const ext = path.substring(path.lastIndexOf(".")).toLowerCase();
  const types: Record<string, string> = {
    ".html": "text/html; charset=utf-8",
    ".css": "text/css; charset=utf-8",
    ".js": "application/javascript; charset=utf-8",
    ".json": "application/json; charset=utf-8",
    ".svg": "image/svg+xml",
    ".png": "image/png",
    ".woff2": "font/woff2",
    ".woff": "font/woff",
    ".map": "application/json",
    ".txt": "text/plain",
  };
  return types[ext] || "application/octet-stream";
}

async function storeFilesInCache(cacheName: string, files: UpdateManifest["files"]): Promise<void> {
  const cache = await caches.open(cacheName);

  const promises = files.map(async (file) => {
    try {
      // Decode base64 to Uint8Array
      const binaryStr = atob(file.content);
      const bytes = new Uint8Array(binaryStr.length);
      for (let i = 0; i < binaryStr.length; i++) {
        bytes[i] = binaryStr.charCodeAt(i);
      }
      const response = new Response(bytes, {
        headers: {
          "Content-Type": getContentType(file.path),
          "Cache-Control": "no-cache",
        },
      });
      // Store with and without leading slash for compatibility
      await cache.put(file.path, response.clone());
      if (!file.path.startsWith("/")) {
        await cache.put("/" + file.path, response);
      }
    } catch (err) {
      console.warn(`Error storing ${file.path}:`, err);
    }
  });

  await Promise.all(promises);
}

// ---- Main update functions ----

/**
 * Read and validate an update manifest file
 */
export async function readUpdateFile(file: File): Promise<UpdateManifest> {
  const text = await file.text();
  const manifest = JSON.parse(text) as UpdateManifest;

  if (!manifest.version || !manifest.files || !Array.isArray(manifest.files)) {
    throw new Error("Formato de actualización inválido: falta versión o archivos");
  }

  if (manifest.files.length === 0) {
    throw new Error("El paquete no contiene archivos");
  }

  return manifest;
}

/**
 * Check if the update manifest is newer than current version
 */
export async function isUpdateAvailable(manifest: UpdateManifest): Promise<boolean> {
  const current = await getCurrentVersion();
  return compareVersions(manifest.version, current) > 0;
}

/**
 * Store update files in cache and prepare for activation
 */
export async function prepareUpdate(manifest: UpdateManifest): Promise<{
  cacheName: string;
  fileCount: number;
}> {
  const cacheName = `mis-gastos-update-v${manifest.version}`;
  await storeFilesInCache(cacheName, manifest.files);
  return { cacheName, fileCount: manifest.files.length };
}

/**
 * Activate the prepared update by telling the Service Worker to switch caches
 */
export async function activateUpdate(cacheName: string): Promise<void> {
  const sw = getSW();
  if (sw) {
    sw.postMessage({ type: "CACHE_UPDATED", data: { cacheName } });
    await new Promise<void>((resolve) => {
      const handler = (event: MessageEvent) => {
        if (event.data?.type === "CACHE_SWITCHED") {
          navigator.serviceWorker.removeEventListener("message", handler);
          resolve();
        }
      };
      navigator.serviceWorker.addEventListener("message", handler);
      setTimeout(() => {
        navigator.serviceWorker.removeEventListener("message", handler);
        resolve();
      }, 8000);
    });
  }
}

/**
 * Full update flow: read file -> validate -> store -> activate
 */
export async function applyUpdateFromFile(
  file: File,
  onProgress?: (msg: string) => void
): Promise<{ success: boolean; version: string; error?: string }> {
  try {
    onProgress?.("Leyendo paquete de actualización...");
    const manifest = await readUpdateFile(file);

    onProgress?.("Verificando versión...");
    const available = await isUpdateAvailable(manifest);
    if (!available) {
      const current = await getCurrentVersion();
      return {
        success: false,
        version: manifest.version,
        error: `La versión ${manifest.version} no es más reciente que la actual (${current})`,
      };
    }

    onProgress?.(`Almacenando ${manifest.files.length} archivos...`);
    const { cacheName, fileCount } = await prepareUpdate(manifest);

    onProgress?.("Activando actualización...");
    await activateUpdate(cacheName);
    await setCurrentVersion(manifest.version);

    onProgress?.("Actualización aplicada correctamente");
    return { success: true, version: manifest.version };
  } catch (err: any) {
    return {
      success: false,
      version: "",
      error: err.message || "Error desconocido al aplicar la actualización",
    };
  }
}

/**
 * Register the Service Worker
 */
export async function registerServiceWorker(): Promise<boolean> {
  if (typeof navigator === "undefined" || !("serviceWorker" in navigator)) {
    return false;
  }

  try {
    const registration = await navigator.serviceWorker.register("/sw.js", {
      scope: "/",
    });

    // If there's an update waiting, let it activate
    if (registration.waiting) {
      registration.waiting.postMessage({ type: "SKIP_WAITING" });
    }

    return true;
  } catch (err) {
    console.warn("Error registering Service Worker:", err);
    return false;
  }
}

/**
 * Get stored update info (pending update, etc.)
 */
export async function getPendingUpdate(): Promise<UpdateManifest | null> {
  return (await dbGet("pendingUpdate")) || null;
}

export async function setPendingUpdate(manifest: UpdateManifest | null): Promise<void> {
  await dbSet("pendingUpdate", manifest);
}
