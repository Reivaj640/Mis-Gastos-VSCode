// ==========================================
// Mis Gastos - Service Worker
// Handles versioned caching for in-app updates
// ==========================================

const DB_NAME = "mis-gastos-sw";
const DB_VERSION = 1;
const STORE_NAME = "settings";
const ACTIVE_CACHE_KEY = "active-cache-name";
const DEFAULT_CACHE_NAME = "mis-gastos-base-v1";

// ---- IndexedDB helpers ----
function openDB() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);
    request.onupgradeneeded = (e) => {
      const db = e.target.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME);
      }
    };
    request.onsuccess = (e) => resolve(e.target.result);
    request.onerror = (e) => reject(e.target.error);
  });
}

function idbGet(db, key) {
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, "readonly");
    const store = tx.objectStore(STORE_NAME);
    const req = store.get(key);
    req.onsuccess = () => resolve(req.result ? req.result.value : null);
    req.onerror = () => reject(req.error);
  });
}

function idbSet(db, key, value) {
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, "readwrite");
    const store = tx.objectStore(STORE_NAME);
    store.put({ key, value });
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}

async function getActiveCacheName() {
  try {
    const db = await openDB();
    const name = await idbGet(db, ACTIVE_CACHE_KEY);
    return name || DEFAULT_CACHE_NAME;
  } catch {
    return DEFAULT_CACHE_NAME;
  }
}

async function setActiveCacheName(name) {
  const db = await openDB();
  await idbSet(db, ACTIVE_CACHE_KEY, name);
}

// ---- Content-Type mapping ----
const MIME_TYPES = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "application/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".svg": "image/svg+xml",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".ico": "image/x-icon",
  ".woff": "font/woff",
  ".woff2": "font/woff2",
  ".txt": "text/plain",
  ".bat": "text/plain",
  ".ps1": "text/plain",
  ".map": "application/json",
};

function getContentType(path) {
  const ext = path.substring(path.lastIndexOf(".")).toLowerCase();
  return MIME_TYPES[ext] || "application/octet-stream";
}

// ---- Install: pre-cache essential files ----
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(DEFAULT_CACHE_NAME).then((cache) => {
      return cache.addAll(["/", "/index.html"]).catch(() => {});
    }).then(() => setActiveCacheName(DEFAULT_CACHE_NAME)).then(() => self.skipWaiting())
  );
});

// ---- Fetch: serve from active cache, then network ----
self.addEventListener("fetch", (event) => {
  // Skip non-GET and chrome-extension requests
  if (event.request.method !== "GET") return;
  const url = new URL(event.request.url);
  if (url.protocol === "chrome-extension:") return;

  event.respondWith(
    getActiveCacheName().then(async (cacheName) => {
      // Try active cache first
      try {
        const cache = await caches.open(cacheName);
        const cached = await cache.match(event.request);
        if (cached) return cached;
      } catch {}

      // Fallback to network, then cache the response
      try {
        const response = await fetch(event.request);
        if (response.ok) {
          try {
            const cache = await caches.open(cacheName);
            cache.put(event.request, response.clone());
          } catch {}
        }
        return response;
      } catch {
        // Network failed, try default cache
        try {
          const defCache = await caches.open(DEFAULT_CACHE_NAME);
          const fallback = await defCache.match(event.request);
          if (fallback) return fallback;
        } catch {}
        return new Response("Offline - Sin conexion", { status: 503 });
      }
    })
  );
});

// ---- Activate ----
self.addEventListener("activate", (event) => {
  event.waitUntil(self.clients.claim());
});

// ---- Messages from main thread ----
self.addEventListener("message", (event) => {
  const { type, data } = event.data || {};

  switch (type) {
    case "GET_ACTIVE_CACHE":
      getActiveCacheName().then((name) => {
        event.source.postMessage({ type: "ACTIVE_CACHE_INFO", data: { cacheName: name } });
      });
      break;

    case "CACHE_UPDATED": {
      // Main thread stored files in a new cache, just activate it
      if (data && data.cacheName) {
        setActiveCacheName(data.cacheName).then(() => {
          event.source.postMessage({
            type: "CACHE_SWITCHED",
            data: { cacheName: data.cacheName },
          });
        });
      }
      break;
    }

    case "STORE_FILE": {
      // Store a single file in the specified cache
      if (data && data.cacheName && data.path && data.content) {
        const bytes = Uint8Array.from(atob(data.content), (c) => c.charCodeAt(0));
        const response = new Response(bytes, {
          headers: { "Content-Type": getContentType(data.path) },
        });
        caches.open(data.cacheName).then((cache) => {
          cache.put(data.path, response);
        });
      }
      break;
    }

    case "SKIP_WAITING":
      self.skipWaiting();
      break;
  }
});
