# AGENTS.md — Mis Gastos

Archivo de contexto para cualquier agente que trabaje en este proyecto.

**Qué es esto:** la ficha técnica del proyecto. En cada sesión, léelo antes de tocar nada.

**Qué NO es:** el registro de "qué cambió hoy" — eso va en `CAMBIOS.md`.

---

## 🚀 Inicio rápido

| Para esto | Haz esto |
|---|---|
| Ver la app en ESTE equipo | `npm run dev` → http://localhost:3000 |
| Ver la app en OTROS equipos de tu red | `npm run build` → `npm run preview:network` → muestra la dirección sola |
| Revisar errores | `npm run lint` → **0 errores y 0 avisos** (deuda #10 saldada). `npm run build` → compilación + tipos en verde |
| Crear el .exe de escritorio | `npm run build:exe` → instalador NSIS + portable en `dist-electron/` (probado 2026-10-03) |
| Ver lo que está mal sin conmovernos | `npm run build` |
| Volver al código original de Javier | `git log --oneline` y `git checkout f68a431 -- .` |

> ⚠️ **`npm run dev` NO funciona bien por la red local.** Si quieres ver la
> app desde el celular u otro computador, usa `npm run build` + `npm run
> preview:network`. El porqué está en `CAMBIOS.md`.

> 🔌 **REGLA DE PUERTOS (obligatoria para todo agente):** la app corre en
> **3000** (`dev`) o **4000** (`preview:network`). Todo proceso sigue el ciclo:
> **se lanza → ocupa el puerto → se cierra → desocupa el puerto**. Al terminar
> de usar cualquier servidor, **detén el proceso y verifica que el puerto
> quede libre** (`Get-NetTCPConnection -LocalPort 4000 -State Listen`).
> **Prohibido usar puertos alternos** como solución de largo plazo y dejar
> procesos encendidos al cerrar una sesión.

---

## 📁 Estructura del proyecto

```
├── src/
│   ├── app/                    # Entrada Next.js (page.tsx + layout.tsx + globals.css)
│   ├── components/            # Componentes de negocio
│   │   ├── Dashboard.tsx       # Vista principal
│   │   ├── Sidebar.tsx         # Navegación (desktop + bottom-nav)
│   │   ├── ExpensesManager.tsx # Gestión de gastos
│   │   ├── IncomeManager.tsx   # Gestión de ingresos
│   │   ├── PaymentForm.tsx     # Registrar pago
│   │   ├── PaymentHistory.tsx   # Historial de pagos
│   │   ├── Settings.tsx        # Configuración + Backup
│   │   ├── UpdateManager.tsx   # Auto-actualizaciones (Electron)
│   │   └── ui/                # Componentes base (Shadcn/ui)
│   ├── hooks/                 # Hooks propios
│   │   ├── useLocalStorage.ts  # Lee/escribe localStorage encriptado
│   │   ├── use-toast.ts        # Notificaciones
│   │   └── use-mobile.ts       # Detectar móvil
│   ├── lib/                   # Utilidades
│   │   ├── types.ts            # Tipos Centrales (leer antes de tocar datos)
│   │   ├── utils.ts            # Funciones puras de UI
│   │   ├── security.ts         # Sanitización XSS, escape CSV
│   │   ├── demo-data.ts        # Datos de ejemplo del primer arranque
│   │   ├── version.ts          # Versión "x.y.z"
│   │   └── updater.ts          # Lógica de actualización
│   ├── services/              # Lógica de negocio (source of truth)
│   │   ├── expenseService.ts
│   │   ├── paymentService.ts
│   │   └── loggerService.ts   # Logger estructurado
│   └── store/
│       └── useAppStore.ts      # Zustand (puente activo: historial deshacer/rehacer)
├── electron/                  # Empaquetado de escritorio
│   ├── main.js                 # Servidor local estático + ventana
│   ├── preload.js              # contextBridge + IPC (10 canales)
│   └── updater.js              # Auto-update desde GitHub Releases
├── public/                    # Archivos estáticos (sw.js, logo.svg, robots.txt)
├── scripts/
│   └── serve-network.cjs      # Sirve `out/` por la red local
├── package.json               # Dependencias y comandos
├── next.config.ts             # output: 'export' (genera carpeta out/)
├── tailwind.config.ts         # CSS variables OKLCH
└── Prompt-Mis-Gastos.txt      # Instrucciones permanentes del agente
```

---

## 🔐 Protocolo de datos (CRÍTICO)

**La app guarda TODO en el navegador del usuario, nada en un servidor.**

| Qué es | Dónde se guarda | Quién lo lee |
|---|---|---|
| Gastos | `localStorage.getItem("expenses")` | `useLocalStorage` |
| Pagos | `localStorage.getItem("payments")` | `useLocalStorage` |
| Ingresos | `localStorage.getItem("incomes")` | `useLocalStorage` |
| Configuración | `localStorage.getItem("appSettings")` | `useLocalStorage` |

**Los datos van encriptados** (AES-GCM vía Web Crypto API). Antes de
tocar cualquier clave o modelo de datos, lee `src/lib/types.ts` y
`src/hooks/useLocalStorage.ts`.

**Regla de oro:** no borres, no renombres ni cambies el formato de esas
claves sin pedir aprobación. Hacerlo rompe los datos del usuario.

---

## 🎨 Sistema visual (qué es "correcto")

- **Colores:** siempre de las variables CSS (OKLCH). Nunca colores crudos en
  los componentes.
- **Componentes:** reutilizar los de `src/components/ui/` antes de crear
  nuevos (regla de Shadcn/ui).
- **Animaciones:** Framer Motion. Usa `AnimatePresence` para las transiciones
  entre vistas.
- **Íconos:** solo `lucide-react`. No se añaden otras librerías de íconos.
- **Tipografía:** Segoe UI / Roboto, ya definida en `globals.css`.

---

## 📐 Diseño responsivo (reglas UI/UX — pendiente #11, Etapa A aprobada)

**Objetivo:** que la app se vea y se use bien en celular, tablet y
escritorio sin romper las reglas visuales. Toda vista nueva o modificada
debe cumplir esta tabla:

| Regla | Cómo se cumple |
|---|---|
| **Primero el celular** | Diseñar para 360 px y subir con las escalas de Tailwind: `sm:` 640 · `md:` 768 · `lg:` 1024 · `xl:` 1280 |
| **Zonas de toque** | Botones e íconos táctiles ≥ 44 × 44 px (p. ej. `min-h-11 min-w-11` o `p-3` en botones pequeños) |
| **Sin zoom automático (iOS)** | Campos de texto con fuente ≥ 16 px (`text-base`); `text-sm` solo a partir de `sm:` |
| **Navegación** | Celular: barra inferior (`lg:hidden fixed bottom-0` + `safe-area-bottom`). Escritorio: barra lateral (`hidden lg:flex`). El contenido principal reserva `pb-24 lg:pb-8` |
| **Bordes y gestos** | Conservar `safe-area-*` (notch, barra de gestos) — no quitarlos al reutilizar estilos |
| **Cuadrículas** | Empezar en `grid-cols-1` y subir con `sm:`/`md:`/`lg:` — nunca fijar varias columnas sin adaptación |
| **Diálogos** | Con tope de ancho (`sm:max-w-md`, `w-full max-w-[calc(100%-2rem)]`) — jamás salirse de la pantalla |
| **Tablas/listas anchas** | `overflow-x-auto` o reordenar a tarjetas en móvil |
| **Colores** | Solo variables CSS OKLCH (misma regla de siempre) |
| **Orientación** | Funcionar en vertical y horizontal; no asumir alturas fijas (salvo barras laterales con `h-screen`) |

**Validación:** revisar cada vista a **360 / 768 / 1024 px** (ventana
redimensionada, o desde el celular/tablet por la red con
`npm run preview:network`). Las etapas **B** (auditoría por vista) y
**C** (validación visual con el usuario) quedan **pendientes de
aprobación**.

---

## ⚡ Estado de las piezas

| Pieza | Estado | Notas |
|---|---|---|
| Arranque local (`npm run dev`) | ✅ Funciona | Para este equipo |
| Arranque de red (`npm run preview:network`) | ✅ Funciona | Para probar en otros equipos |
| Compilación (`npm run build`) | ✅ Sin errores | Con verificación de tipos activa (sin `ignoreBuildErrors`); genera carpeta `out/` |
| Verificación de tipos (`npx tsc --noEmit`) | ✅ Cero errores | Comprobación directa de tipos, independiente del build |
| Revisión de errores (`npm run lint`) | ✅ Limpio | `eslint.config.mjs` (ESLint 9); **0 errores y 0 avisos** (deuda #10 saldada: 83 → 0) |
| Dependencias (`node_modules`) | ✅ Instaladas | 1100 paquetes |
| Control de versiones (Git) | ✅ Activo | Rama `main` |
| Service worker (`sw.js` v3) | ✅ Corregido | Primero la red (siempre versión fresca) con copia de respaldo sin conexión; ver `CAMBIOS.md` |
| Zustand (`useAppStore.ts`) | ✅ En uso | Puente en `page.tsx`: historial deshacer/rehacer (1 acción = 1 paso); guarda en las mismas 4 claves encriptadas |
| Ejecutable Windows (`npm run build:exe`) | ✅ Construido y probado | `Mis-Gastos-Setup.exe` (NSIS) + `Mis-Gastos.exe` (portable) en `dist-electron/`; puerto interno aleatorio `127.0.0.1` (no toca 3000/4000); cerrar la app = X de la ventana (eso sí persiste los datos); reparación de caché `winCodeSign` explicada en `CAMBIOS.md` (2026-10-03) |

> 📌 El **estado vivo** de cada sesión está en `AGENT.MD` — léelo antes de empezar.

---

## ❓ Preguntas frecuentes

**¿Dónde empiezo?**
Lee `CAMBIOS.md` para entender el contexto, luego revisa el componente que
vas a tocar y su dependencia en `src/services/`.

**¿Y si quiero probar un cambio antes de que afecte a los datos?**
Los datos persisten en el localStorage del navegador del usuario. Las
modificaciones no los borran automáticamente. Si un cambio puede afectar
los datos, primero guarda un backup con Configuración > Exportar.

**¿Por qué el código de escritorio no funciona en `localhost`?**
Porque `electron/main.js` sirve la carpeta `out/`, no el modo desarrollo.
En desarrollo abre el browser con `npm run dev`.

**¿`npm run build:exe` falla con "Cannot create symbolic link"?**
Es la caché `winCodeSign` de electron-builder: el `.7z` trae 2 enlaces
de macOS y Windows exige privilegio para crearlos. Solución **sin tocar
Windows**: renombrar la extracción parcial a
`%LOCALAPPDATA%\electron-builder\Cache\winCodeSign\winCodeSign-2.6.0`
y borrar los temporales (la caché solo valida que esa carpeta exista).
Paso a paso en `CAMBIOS.md` (2026-10-03).

**¿Por qué `npm run dev:windows` no existe?**
No era necesario. El comando único `npm run dev` es el que vale en todos
los sistemas.

---

## 🔗 Documentos relacionados

- `Prompt-Mis-Gastos.txt` — Cómo trabajamos juntos (reglas del usuario).
- `CAMBIOS.md` — Registro de cambios, qué se cambió y por qué.
- `README.md` — Documentación del proyecto original.
