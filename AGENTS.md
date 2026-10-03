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

**¿Por qué `npm run dev:windows` no existe?**
No era necesario. El comando único `npm run dev` es el que vale en todos
los sistemas.

---

## 🔗 Documentos relacionados

- `Prompt-Mis-Gastos.txt` — Cómo trabajamos juntos (reglas del usuario).
- `CAMBIOS.md` — Registro de cambios, qué se cambió y por qué.
- `README.md` — Documentación del proyecto original.
