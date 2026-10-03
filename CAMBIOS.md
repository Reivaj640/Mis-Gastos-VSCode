# CAMBIOS — Mis Gastos

Registro de todos los cambios realizados en el proyecto.
Este archivo lo mantiene el agente (yo) en cada modificación.

---

## 2026-10-02 — Puesta en marcha del proyecto (sin tocar el código de la app)

### Qué se hizo

**1. Activé el control de versiones (Git)**
- **Por qué:** el proyecto no tenía Git, así que no había forma de volver
  atrás si un cambio quedaba mal. Sin esto, cualquier error había que
  corregirlo a mano.
- **Qué cambió:** se creó el repositorio local en la carpeta del proyecto,
  en la rama `main`.
- **Punto de retorno creado:** commit `f68a431` — "Punto de partida:
  proyecto original de Mis Gastos v2.1.3".
- Ese commit guarda el proyecto **exactamente como Javier lo entregó**,
  antes de cualquier cambio. Desde ahí se puede volver siempre.

**2. Unifiqué el archivo de instrucciones `Prompt-Mis-Gastos.txt`**
- **Por qué:** existían dos versiones del prompt (una con el detalle técnico
  del proyecto y otra con la forma de trabajar acordada). Tenerlas separadas
  obligaba a leer dos archivos en cada sesión.
- **Qué cambió:** ahora es un solo archivo en dos partes:
  - **Parte I — Acuerdo de trabajo:** tu rol, mi rol, flujo, seguridad.
  - **Parte II — Guía técnica:** stack real, sistema visual, contratos de
    datos, arquitectura, privacidad.
- Se agregó una sección 22 con los comandos de referencia del proyecto.

**3. Creé este archivo `CAMBIOS.md`**
- Para dejar constancia de qué se cambia y por qué, como pide el prompt.

### Qué NO se hizo (importante)

- **No se modificó ni una línea del código de la aplicación.** Los 96
  archivos del proyecto quedaron intactos, exactamente como venían.
- No se actualizó ninguna dependencia.
- No se eliminó nada.

### Estado actual del proyecto

| Elemento | Estado |
|----------|--------|
| Control de versiones (Git) | Activo, rama `main` |
| Punto de retorno | `f68a431` (estado original) |
| Código de la app | Sin modificar |
| Node.js en el computador | Instalado por el usuario — v26.10.0 |
| Dependencias (`node_modules`) | Instaladas — 1100 paquetes |
| Compilación de producción | **Correcta** — sin errores |
| Prueba de arranque | **Correcta** — la app responde bien |
| Carpeta `out/` (versión compilada) | Regenerada y verificada |

### 2) Se instaló el entorno y se verificó que la app funciona

**Node.js** (lo instaló el usuario): v26.10.0.
**Dependencias del proyecto**: 1100 paquetes instalados en 1 minuto.

**Verificaciones realizadas:**

| Prueba | Resultado |
|--------|-----------|
| Compilar para producción (`npm run build`) | ✅ Correcto, 10.2 s, sin errores |
| Abrir la aplicación en el navegador | ✅ Responde correctamente (HTTP 200, 18 KB) |
| ¿Aparece el nombre y la pantalla de la app? | ✅ Sí |

**La aplicación abre y funciona correctamente.** No se modificó nada del
código para lograr esto.

### Problema detectado que requiere decisión (NO corregido todavía)

**El comando `npm run dev` no funciona en Windows.**

- El proyecto trae este comando: `next dev -p 3000 2>&1 | tee dev.log`
- `tee` es una instrucción de Linux, **no existe en Windows**.
- Resultado: el comando se cierra de inmediato con un error y la app
  nunca abre.
- **Orden temporal que sí funciona en Windows:**
  `npx next dev -p 3000`
- **Corrección propuesta (una línea, pendiente de tu aprobación):**
  cambiar el comando en `package.json` para que funcione en ambos
  sistemas, o dejar `npm run dev` solo para Linux y agregar un
  `npm run dev:windows` para Windows.
- **No lo cambié** porque modifica la estructura del proyecto y la regla
  acordada es pedir aprobación antes.

### Aviso menor

Al compilar, Next.js avisa que falta definir `metadataBase` en los datos
de la página. No afecta el funcionamiento: solo afecta cómo se ven los
enlaces al compartir la app en redes sociales. Queda anotado para
cuando se decida trabalhar en eso.

---

## 2026-10-02 — Arranque en Windows y diagnóstico del loop de carga

### 1) Arreglado el botón de arranque (autorizado por el usuario)

**Problema:** el comando de arranque del proyecto no funcionaba en
Windows porque usaba `tee`, una instrucción que solo existe en Linux.

**Qué se cambió** — una línea en `package.json`:

| | Antes | Después |
|---|---|---|
| Comando de arranque | `next dev -p 3000 2>&1 | tee dev.log` | `next dev -p 3000` |

**Por qué:** `tee` solo servía para guardar un archivo de registro que no
se usa para nada. Al quitarlo, el comando ahora funciona igual en
Windows, Mac y Linux.

**Efecto colateral:** el proyecto ya no genera el archivo `dev.log`.
No afecta la aplicación.

**Verificado:** el comando arranca correctamente en Windows.

### 2) Loop de carga al abrir por la red — RESUELTO ✅

**Síntoma:** al abrir `http://192.168.1.6:3000` desde otro equipo, la
aplicación se quedaba en "Cargando Mis Gastos" para siempre. En el mismo
equipo sí funcionaba.

**Hipótesis descartadas durante la investigación:**

| Hipótesis | Cómo se descartó |
|---|---|
| Service worker `public/sw.js` | Fallaba igual en ventana de incógnito (que no usa copias guardadas) |
| Navegador bloqueando (Brave) | Reprodujo igual en Chrome y Edge |
| Código de la app colgado | Revisado a fondo: termina en menos de 1 segundo, siempre |
| Servidor sin enviar archivos | Los 21 archivos responden bien (HTTP 200) |

**CAUSA REAL (confirmada con la foto de la consola del navegador):**

```
WebSocket connection to 'ws://192.168.1.6:3000/_next/webpack-hmr' failed.
```

Es la **conexión de recarga automática** que usa el modo desarrollo.
El servidor de desarrollo pesa **6,7 MB** (con un archivo de 1 MB) y
mantiene esa conexión abierta. En red local se corta (el equipo tiene
dos conexiones activas: cable en 192.168.1.6 y Wi-Fi en 192.168.1.8),
la recarga nunca se completa y la app se queda esperando.

### SOLUCIÓN APLICADA Y VERIFICADA

Se creó `scripts/serve-network.cjs` y el comando `npm run preview:network`.

Sirve la versión **ya compilada** (la misma que se publicaría): pesa
**1,3 MB**, no usa la conexión que fallaba, y es estable en red local.

| Quiero... | Comando | Dirección |
|---|---|---|
| Ver la app en ESTE equipo (trabajar) | `npm run dev` | `http://localhost:3000` |
| Ver la app en OTROS equipos | `npm run build` + `npm run preview:network` | Se muestra sola al arrancar (puerto 4000) |

Al arrancar, el comando muestra la dirección exacta en pantalla.

**Verificación:**

| Prueba | Resultado |
|---|---|
| `npm run preview:network` arranca | ✅ Muestra la dirección sola |
| Cargar en la red desde otro equipo | ✅ **Confirmado por el usuario: funciona** |
| Compilar y abrir en este equipo | ✅ Funciona |

### 3) Otro detalle detectado (sin acción)

El archivo `.env` contiene una ruta del computador de Javier
(`/home/z/my-project/...`). No causa ningún problema: la aplicación no
usa esa base de datos, guarda todo en el navegador del usuario. Queda
anotado solo por limpieza futura.

### Estado de Git (para volver atrás)

| Quiero... | Qué se hace |
|-----------|-------------|
| Ver qué archivos cambié | `git status` |
| Crear un punto de retorno | `git add -A` y luego `git commit -m "mensaje"` |
| Volver al estado original de Javier | `git log --oneline` para ver el código de cada versión, y `git checkout f68a431 -- .` para restaurar los archivos |

---

## 2026-10-02 — Cierre de la sesión: trabajo pendiente guardado y archivo AGENT.MD

### 1) Se guardó en Git lo que quedó sin commit

La solución de red (servidor `scripts/serve-network.cjs`, comando
`preview:network` y la actualización de este registro) estaba probada y
confirmada, pero **no se había creado el punto de retorno en Git**.

- **Commit:** `99a561d` — "Solucionar carga por red local con comando preview:network".
- **Estado:** la rama `main` quedó **sin cambios pendientes de guardar**.

### 2) Se creó `AGENT.MD` (nuevo archivo)

- **Por qué:** se necesita un tablero de estado que se actualice en cada
  sesión, para que cualquier agente que entre sepa al instante en qué
  queda el proyecto sin tener que reconstruir el historial completo.
- **Qué contiene:** última sesión, estado general de las piezas, historial
  de sesiones con sus commits, pendientes detectados y las instrucciones
  para mantenerlo al día.
- **No sustituye a nadie:** `CAMBIOS.md` sigue siendo el registro de qué
  cambió y por qué; `AGENTS.md` sigue siendo la ficha técnica.
- **Costo:** cero riesgo — es un documento, no toca código ni datos.

---

## 2026-10-02 — Evaluación de los 6 pendientes y Etapa 1 ejecutada

### Evaluación (diagnóstico contra el código real)

| # | Pendiente | Qué se encontró | Riesgo | Veredicto |
|---|---|---|---|---|
| 1 | Service worker | Es el motor del sistema de actualizaciones internas (UpdateManager). Estrategia "primero la copia": nunca refresca en el camino normal → este equipo puede ver versiones viejas tras recompilar. En otros equipos NO se activa (los navegadores lo rechazan en HTTP de red). No toca datos | **Medio** | **Pendiente — Etapa 2 aparte** |
| 2 | `metadataBase` | Faltaba en `layout.tsx`; además la imagen `og-image.png` referenciada **no existía** en `public/` | Nulo | ✅ Corregido |
| 3 | `.env` | Una sola línea con la ruta vieja de Javier; nadie la lee; no está en Git; sin secretos | Nulo | ✅ Borrado |
| 4 | `npm run start` | Roto de 4 formas: `bun` no instalado, `tee` solo Linux, entorno incompatible con Windows y `.next/standalone` no existe (la app exporta estático) | Nulo | ✅ Comando eliminado |
| 5 | Comandos `db:*` | **No existe ningún `schema.prisma`** en el proyecto → siempre fallarían; `src/lib/db.ts` no lo importaba nadie | Nulo | ✅ Comandos y `db.ts` eliminados |
| 6 | Zustand `useAppStore` | Nadie lo importa (no entra en la app compilada) y el prompt lo reserva para el futuro "deshacer/rehacer" | Nulo | Se mantiene documentado |

### Hallazgos nuevos detectados durante la evaluación (reportados, no corregidos)

| # | Hallazgo | Detalle |
|---|---|---|
| 7 | `next.config.ts` ignora errores de tipado | `typescript: { ignoreBuildErrors: true }` hace que el build pase aunque haya errores de tipo. Contradice el tipado estricto del prompt. Heredado del original |
| 8 | `npm run lint` nunca funcionó | ESLint 9 exige `eslint.config.*` y **no existe** en el proyecto → el comando falla siempre. La fila correspondiente de `AGENTS.md` quedó corregida |

### Cambios ejecutados (Etapa 1 — aprobada por el usuario)

| Archivo | Cambio |
|---|---|
| `src/app/layout.tsx` | + `metadataBase: new URL("https://misgastos.app")`; se quitó la referencia a `og-image.png` (no existe); `twitter.card` → `summary` |
| `package.json` | − comando `start`; − comandos `db:push`, `db:generate`, `db:migrate`, `db:reset` |
| `src/lib/db.ts` | Borrado (nadie lo importaba; verificado antes y después) |
| `.env` | Borrado (no estaba en Git) |

### Verificación

| Prueba | Resultado |
|---|---|
| `npm run lint` | ⚠️ Falla por causa preexistente (pendiente #8), no por estos cambios |
| `npm run build` | ✅ Correcto en 6.3 s, **sin el aviso de `metadataBase`** |
| HTML generado (`out/index.html`) | ✅ URLs absolutas de OpenGraph, sin `og:image` roto, UTF-8 intacto |
| Búsquedas de `lib/db` y `DATABASE_URL` | ✅ Cero referencias en todo el proyecto |
| Commit | `53e4b9c` |

**No se tocó:** el service worker, Zustand, las dependencias instaladas, el esquema de datos ni ningún módulo de la app.

---

*Proyecto original: Reivaj640 / Mis-Gastos-VSCode · Licencia MIT · Atribución conservada*
