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
| Revisar errores | `npm run lint` ⚠️ **Hoy falla**: le falta la configuración de ESLint 9 (pendiente #8 de `AGENT.MD`). Mientras tanto, `npm run build` es la verificación confiable |
| Ver lo que está mal sin conmovernos | `npm run build` |
| Volver al código original de Javier | `git log --oneline` y `git checkout f68a431 -- .` |

> ⚠️ **`npm run dev` NO funciona bien por la red local.** Si quieres ver la
> app desde el celular u otro computador, usa `npm run build` + `npm run
> preview:network`. El porqué está en `CAMBIOS.md`.

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
│       └── useAppStore.ts      # Zustand (existe, NO en uso activo)
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
| Compilación (`npm run build`) | ✅ Sin errores | Genera carpeta `out/` |
| Revisión de errores (`npm run lint`) | ⚠️ No funciona | Sin configuración de ESLint 9 (pendiente #8) |
| Dependencias (`node_modules`) | ✅ Instaladas | 1100 paquetes |
| Control de versiones (Git) | ✅ Activo | Rama `main` |
| Service worker | ⚠️ Pendiente #1 | "Primero la copia": puede servir versiones viejas en este equipo; en otros equipos no se activa |
| Zustand (`useAppStore.ts`) | ⚠️ No en uso | Reservado para el futuro "deshacer/rehacer"; no borrar |

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
