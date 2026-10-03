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

## 2026-10-02 — Etapa 2: service worker corregido y probado (pendiente #1 resuelto)

### Diagnóstico
Confirmado el riesgo del pendiente #1: la estrategia *"primero la copia"* **nunca
refrescaba** en el camino normal → este equipo podía ver versiones viejas tras
recompilar. En otros equipos el servicio no se activa (los navegadores lo rechazan
en HTTP de red), por lo que el riesgo era local.

### Cambio aplicado (autorizado por el usuario — Etapa 2)

**Solo `public/sw.js`** (v2 → v3):

| Camino | Antes | Después |
|---|---|---|
| Normal (caché base) | Primero la copia, sin refresco | **Primero la red** → siempre la versión más reciente; cada respuesta buena actualiza la copia |
| Sin conexión / red con error | Solo caía a copia si la descarga fallaba | Falla **o error 502/503** → última copia guardada; sin copia → aviso 503 |
| Actualización oficial aplicada (`mis-gastos-update-*`) | Primero la copia | **Primero la copia (sin cambios)** — protege el sistema de actualizaciones internas |

- **No toca:** datos, tipos, storage, IPC ni otros módulos. Reversible con
  `git checkout 63a8077 -- public/sw.js`.

### Hallazgos durante la prueba (reportados)

1. **Corrección surgida de las pruebas:** el entorno de prueba devuelve **502**
   en vez de rechazo de conexión cuando el servidor cae; la primera versión del
   cambio pasaba ese error sin usar la copia. Se agregó el respaldo en errores
   5xx. *Para el usuario final el comportamiento correcto es el mismo: app usable.*
2. **Servidor Next huérfano:** proceso PID 23240 (arrancó **19:57 de la sesión
   anterior**) escucha en `::1:4000` y **captura `localhost:4000`** antes que
   `preview:network`. No se tocó — **pendiente de decisión del usuario**. Por eso
   las pruebas se hicieron en el puerto 4001.
3. **`preview:network` sirve `out/`** → tras tocar `public/` hay que recompilar
   (`npm run build`) para que el cambio llegue al navegador.

### Pruebas (navegador real, contra `preview:network` en puerto 4001)

| Prueba | Resultado |
|---|---|
| Registro y activación del service worker v3 | ✅ |
| **Frescura:** copia vieja (con marcador) en el navegador + servidor actualizado sin marcador → al recargar **NO** aparece lo viejo | ✅ |
| Carga normal con el servidor arriba | ✅ |
| **Sin conexión:** servidor APAGADO → la app abre **completa** desde la copia guardada | ✅ |
| `node --check` + `npm run build` | ✅ |
| Pestaña de pruebas cerrada y procesos propios detenidos | ✅ |

**Commit:** `9e04323` — *"Etapa 2: service worker primero-la-red con respaldo sin conexion"*.

---

## 2026-10-02 — Cierre: servidor huérfano eliminado y regla de puertos (pendiente #9 resuelto)

**Decisión del usuario:** la app corre en su puerto habitual (**4000**) y todo
proceso debe cumplir el ciclo **se lanza → ocupa el puerto → se cierra →
desocupa el puerto**. Prohibido usar puertos alternos como solución permanente
ni dejar procesos encendidos al terminar una sesión.

### Acciones

| Acción | Resultado |
|---|---|
| Detener el servidor Next huérfano (PID 23240, `::1:4000`, arrancó 19:57 de la sesión anterior) | ✅ Detenido |
| Verificar puerto 4000 libre | ✅ **Libre** |
| **Ciclo completo en 4000:** lanzar `preview:network` → ocupa (PID 21752) → contenido correcto (HTML 11.417 B, `sw.js` v3) → cerrar | ✅ Verificado |
| Verificar puerto 4000 libre tras cerrar | ✅ **Libre, ya no responde** |

**Nota:** las pruebas de la Etapa 2 se hicieron en el puerto 4001 **solo**
mientras el huérfano bloqueaba el 4000. Con él eliminado, se usará
exclusivamente el 4000. La regla quedó escrita en `AGENTS.md`.

**Pendiente #9 → resuelto.**

---

## 2026-10-02 — Validación manual de la Etapa 2 en el puerto 4000

**Prueba manual del usuario:** éxito — abrió la app con `preview:network` y
cerró con `Ctrl + C`. **Causa raíz confirmada del huérfano #9:** cerrar la
terminal con la **X** en lugar de `Ctrl + C` (a veces VS Code no mata el
proceso hijo).

### Hallazgo
La prueba del usuario de las **21:57 seguía corriendo** (PID 26180) — otra
ocurrencia del mismo hábito. Se detuvo y se verificó el puerto libre.

### Checklist in-app completado en el puerto 4000 (estándar)

| Paso | Resultado |
|---|---|
| Lanzar `preview:network` en 4000 | ✅ |
| Abrir **Configuración** → activa el sistema de copias | ✅ Panel de actualizaciones visible, service worker registrado por la interfaz real |
| Recargar → siempre muestra la última versión | ✅ v2.1.3, service worker activo con el fix 502 |
| Cerrar y liberar el puerto | ✅ **4000 LIBRE**, ya no responde |

**Sin cambios de código.** Las pruebas técnicas de la Etapa 2 se habían hecho
en 4001 solo por el bloqueo del huérfano; con él eliminado, la validación
oficial quedó hecha en el **puerto 4000**.

---

## 2026-10-02 — Pendientes #7 y #8: compilación con tipos verificados + ESLint 9 funcionando

**Autorización del usuario:** *"Continúa con lo siguiente, lo autorizo,
prosigue"* — ejecutar #7 y #8; **#6 (Zustand) se mantiene sin tocar**.

### #8 — `npm run lint` dejó de fallar

Se creó **`eslint.config.mjs`** (formato plano que exige ESLint 9), usando
únicamente las reglas oficiales `eslint-config-next/core-web-vitals` +
`eslint-config-next/typescript` (v16) — **sin dependencias nuevas**, con
ignorados para `.next/`, `out/`, `dist*/` y `node_modules/`.

- **Antes:** `npm run lint` → error inmediato (sin configuración).
- **Ahora:** corre y reporta **83 problemas preexistentes (32 errores / 51
  avisos)** → deuda hoy visible = nuevo pendiente **#10**.
- Reparto de errores: ~15 en herramientas Node (`electron/`, `scripts/` —
  allí `require()` es correcto, falsos positivos de lint web) y ~17 en
  `src/` (`no-explicit-any`, `set-state-in-effect`, `no-unused-vars`).

### #7 — la compilación ya no ignora errores de tipado

Se quitó `typescript: { ignoreBuildErrors: true }` de `next.config.ts`.
Eso destapó **6 errores originales + 9 más** que estaban ocultos:

| Qué estaba mal | Corrección |
|---|---|
| 4 archivos importaban `@/types` — módulo que **nunca existió** en el historial de Git | Rutas cambiadas a `@/lib/types` (ubicación oficial) |
| `useLocalStorage.getEncryptionKey` prometía `CryptoKey` pero devolvía una promesa | Firma corregida con `async/await` (función sin uso = riesgo cero) |
| `updater.activateUpdate` usaba `handler` fuera de su ámbito — **fuga real de escucha** tapada por un `try/catch` | `handler` declarada al alcance correcto: la limpieza ahora sí la quita |
| `paymentService` leía `.date` (7 usos) — el campo oficial es `paymentDate` (así lo usa toda la interfaz activa) | Alineado a `paymentDate` |
| `expenseService.getDueDate` recibía `dueDay` opcional como obligatorio | Parámetro `number \| undefined` + defecto = último día del mes (sin día definido nunca queda vencido) |
| `AppSettings` no declaraba campos que el store sí usa (`periodStartDay`, `currency`, `locale`, `theme`) | Añadidos como **opcionales**; los 2 literales del store ahora incluyen además los campos oficiales requeridos. El store quedó intacto en todo lo demás |

### Verificaciones (todas pasadas)

| Prueba | Resultado |
|---|---|
| `npx tsc --noEmit` | ✅ **EXIT 0 — cero errores** |
| `npm run build` (tipos activos) | ✅ EXIT 0 — imprime `Running TypeScript ... Finished` (prueba de que la verificación corre) |
| `npm run lint` | ✅ Corre y lista problemas (83 preexistentes) |
| Humo en puerto 4000 (`preview:network`) | ✅ Dashboard completo, sin capa de errores, `readyState: complete` |
| Ciclo de puerto | ✅ Servidor detenido → **4000 LIBRE** |

**Sin cambios en datos** (claves de localStorage intactas) y **sin
dependencias nuevas**. Archivos tocados: `eslint.config.mjs` (nuevo),
`next.config.ts`, `src/lib/types.ts`, `src/lib/updater.ts`,
`src/hooks/useLocalStorage.ts`, `src/services/expenseService.ts`,
`src/services/paymentService.ts`, `src/store/useAppStore.ts`,
`src/components/AdvancedSearch.tsx` + los 3 documentos de trabajo.

---

## 2026-10-02 — Pendiente #6: Zustand activado con deshacer/rehacer 1 a 1

**Autorización del usuario:** *"implementemos el pendiente #6 y luego el
#10, ejecuta pruebas validando que todo funcione y que no se afecte el
estado actual del sistema"*.

### Qué se hizo

**1. El store `useAppStore.ts` pasó de dormido a activo (patrón puente)**
- **Por qué:** era el pendiente #6 — tener deshacer/rehacer real sin
  perder datos y sin cambiar el formato de guardado.
- **Cómo quedó:** `page.tsx` es el único puente (sigue siendo el único
  archivo que usa `useLocalStorage`). Al terminar la desencriptación de
  las 4 claves, carga los datos en el store; a partir de ahí:
  - **Lectura:** las vistas reciben los datos del store (mismas
    propiedades de siempre).
  - **Escritura:** las vistas llaman a `setExpenses`/`setPayments`/
    `setIncomes`/`setSettings` como siempre, pero esos nombres ahora
    apuntan a las **acciones del store**, que registran cada cambio en el
    historial.
  - **Guardado:** el store escribe en las **mismas 4 claves encriptadas**
    (`expenses`, `payments`, `incomes`, `appSettings`), comparando
    **por contenido** — si deshacer restaura un contenido idéntico, la
    clave no se reescribe.
- **Las vistas (`ExpensesManager`, `Settings`, etc.) NO se tocaron** —
  reciben exactamente las mismas propiedades.

**2. Se corrigieron 2 fallas que el store dormido nunca había ejecutado**
- `initialize` metía el estado vacío en el historial → el primer Ctrl+Z
  habría **borrado todos los datos**. Ahora la carga inicial no genera
  historial (no se puede "deshacer" la propia carga).
- `undo`/`redo` tenían desfase de un paso (deshacía de más). Se
  reescribieron con pila correcta: **1 acción = 1 entrada = 1 paso**;
  además `redo` ahora usa una pila propia (`future`) que se limpia al
  hacer una acción nueva.

**3. Se quitó la persistencia en texto plano del store**
- El middleware `persist` escribía `mis-gastos-storage` **sin encriptar**
  (copia del dato real en claro). Eliminado: solo existen las 4 claves
  cifradas de siempre. El store vive en memoria y se recarga desde las
  claves al abrir la app.

**4. Interfaz y atajos**
- Dos botones flotantes (abajo a la derecha) con iconos lucide
  `Undo2`/`Redo2`: aparecen solo cuando hay historial, con estados
  habilitado/deshabilitado.
- Atajos: `Ctrl+Z` deshacer · `Ctrl+Y` o `Ctrl+Shift+Z` rehacer — se
  desactivan dentro de campos de texto (no roban el deshacer nativo).

**5. El gancho `useLocalStorage` ganó una marca de "datos listos"**
- Tercer elemento de la tupla: `[valor, escribir, listo]`. Solo marca que
  la desencriptación terminó — **ni una línea de encriptación se tocó**.

### Cómo se protegió tu dato (regla de oro)

- **Mismas 4 claves, mismo formato `{data, hash, iv}`, misma contraseña.**
  Cero cambios de formato.
- Escrituras **por contenido**: deshacer/rehacer de un gasto no reescribe
  `payments`/`incomes`/`appSettings` (verificado byte a byte).
- La carga de la app **no escribe nada** en las claves (hidratación pura).

### Pruebas (navegador real, `preview:network` puerto 4000)

| Prueba | Resultado |
|---|---|
| Claves antes/después de cargar la versión nueva | ✅ **byte idénticas** (cero escrituras en reposo) |
| Dashboard con datos reales | ✅ "1 de 10 cumplidos", montos correctos |
| Crear gasto de prueba | ✅ 11 gastos; solo cambió `expenses`; `payments`/`incomes` byte idénticos |
| `Ctrl+Z` tras 1 acción | ✅ vuelve a 10 en **1 paso**; un segundo Ctrl+Z NO borró datos (bug corregido) |
| `Ctrl+Y` | ✅ restaura exactamente el gasto |
| Estados de botones en cada paso | ✅ correctos (habilitado/deshabilitado) |
| Recarga tras el ciclo | ✅ datos intactos, historial limpio (botones ausentes), sin escrituras, `appSettings` no apareció |
| `mis-gastos-storage` | ✅ **nunca se crea** |
| `npx tsc --noEmit` / `npm run build` | ✅ EXIT 0 / EXIT 0 |
| `npm run lint` | ✅ 83 = misma línea base (cero problemas nuevos) |
| Ciclo de puerto | ✅ servidor detenido → **4000 LIBRE** sin huérfanos |

**Archivos tocados:** `src/store/useAppStore.ts` (historial corregido +
persist fuera), `src/app/page.tsx` (puente + botones + atajos),
`src/hooks/useLocalStorage.ts` (marca de "datos listos") + los 3
documentos de trabajo (`AGENT.MD`, `CAMBIOS.md`, `AGENTS.md`).

**Nota:** `Prompt-Mis-Gastos.txt` (Parte II) todavía describe el store
como "no está en uso" — actualizarlo requiere decisión del usuario.

**Commit:** pendiente de mostrar al usuario (serie `+15`).

---

## 2026-10-02 — Pendiente #10: deuda de lint saldada (83 → 0)

**Autorización del usuario:** *"implementemos el pendiente #6 y luego el
#10, ejecuta pruebas validando que todo funcione y que no se afecte el
estado actual del sistema"*.

### Qué era

Al crear el ESLint 9 (#8) apareció la deuda: **83 problemas (32 errores
/ 51 avisos)** repartidos en herramientas Node, código fuente y
componentes.

### Qué se hizo

**1. Configuración honesta — 14 "errores" que eran falsos positivos**
- `electron/main.js`, `electron/preload.js`, `electron/updater.js`,
  `scripts/generate-update.js` y `scripts/serve-network.cjs` usan
  `require()` porque **son CommonJS** (proceso principal de Electron y
  scripts de Node). En `eslint.config.mjs` se apagó
  `@typescript-eslint/no-require-imports` **solo para esos archivos**, con
  comentario que lo justifica.

**2. Código fuente — arreglos reales, sin ignorar nada (~50 avisos)**
- Imports y variables declarados nunca usados → eliminados (mayoría en
  `PaymentForm` 16, `PaymentHistory` 10, `Sidebar` 6, `AlertBanner` 4).
- En `PaymentHistory` quedó sin uso una "búsqueda avanzada" incompleta
  (montos/fechas siempre vacíos, sin interfaz): se quitó el estado muerto
  y sus ramas de filtro — **el comportamiento visible es idéntico** (esos
  filtros nunca podían activarse).
- `paymentsToCSV` (Exportar CSV): parámetro sin uso quitado y arreglos
  `any[]` tipados con `Payment[]`/`Expense[]` (el que lo llama actualizó
  su llamada).
- Código muerto eliminado: la función entera `sendToSW` en `updater.ts`
  (5 problemas de una) y `getEncryptionKey` en `useLocalStorage`.
- `catch (err)` con `err` sin usar → `catch {}`; el `const actionTypes`
  de `use-toast` solo se usaba como tipo → el tipo quedó definido
  directo.

**3. Los 13 `any` → tipos reales**
- `Dashboard` (prop muerta `expenses` quitada + `expense: Expense`),
  `updater.ts` (genérico `dbGet<T>`, `dbSet(..., unknown)`, `catch` con
  comprobación `instanceof Error`), `Settings`, `UpdateManager`,
  `utils.ts`.

**4. Los 5 errores de patrón React → los patrones que React recomienda**
- `use-mobile.ts`: reescrito con **`useSyncExternalStore`** (suscripción
  a `matchMedia` sin `setState` dentro del efecto).
- `carousel.tsx`: estado de desplazamiento reescrito con
  **`useSyncExternalStore`** (de paso se cerró una suscripción que se
  filtraba — el listener `reInit` nunca se desuscribía). Componente sin
  uso en la app; validado por tipos.
- `UpdateManager`: `isElectron` pasó a **inicialización diferida**
  (`useState(() => ...)`) en vez de `setIsElectron` en el efecto.
- `ui/sidebar.tsx`: el ancho aleatorio del esqueleto (`Math.random`
  durante el render = desajuste de hidratación) pasó a **ancho fijo**.
- `page.tsx`: **1 sola excepción documentada** — `eslint-disable` con
  justificación para el `setInitError` de la inicialización única de
  arranque (moverlo alteraría el orden de arranque).

### Pruebas (validando "que no se afecte el estado actual")

| Prueba | Resultado |
|---|---|
| `npm run lint` | ✅ **EXIT 0 — 0 errores y 0 avisos** (antes 83) |
| `npx tsc --noEmit` / `npm run build` | ✅ EXIT 0 / EXIT 0 |
| Carga en navegador (puerto 4000) | ✅ "1 de 10 cumplidos · $2.209.900" |
| 3 claves antes/después de 2 recargas | ✅ **byte idénticas** (cero escrituras; verificado contra copia en `sessionStorage`) |
| `appSettings` / `mis-gastos-storage` | ✅ ausentes (igual que antes) |
| Vistas Resumen, Historial, Registrar Pago, Configuración y Gastos | ✅ renderizan sin errores |
| Exportar CSV (Historial) | ✅ toast de confirmación, sin errores |
| Ciclo de puerto | ✅ servidor detenido → **4000 LIBRE** sin huérfanos |

**Nota:** la rama "móvil" de `useIsMobile` no pudo emularse en este
entorno (no hay herramienta de redimensionar); se dejó el patrón
canónico de React y se verificó la rama de escritorio.

**Archivos tocados:** `eslint.config.mjs`, `src/hooks/{use-mobile,
use-toast,useLocalStorage}.ts`, `src/lib/{updater,utils}.ts`,
`src/services/loggerService.ts`, `src/app/page.tsx` (1 comentario),
`src/components/{Dashboard,PaymentForm,PaymentHistory,Sidebar,AlertBanner,
Settings,UpdateManager,AdvancedSearch}.tsx`,
`src/components/ui/{carousel,sidebar}.tsx`, `electron/main.js`,
`scripts/serve-network.cjs` + los 3 documentos de trabajo.

**Commit:** `+16` (`5075378`).

---

## 2026-10-03 — Mantenimiento: `Prompt-Mis-Gastos.txt` actualizado (Zustand)

**Autorización del usuario:** *"actualizalo"*.

- La **Parte II** (tabla de tecnologías + nota) y el apartado **"Toda
  lectura/escritura pasa por..."** decían que `useAppStore` "existe pero
  **no está en uso activo**" — **falso desde el commit `+15`**.
- Se corrigieron los 2 lugares: ahora describen el flujo real — las
  vistas leen/escriben por el store (historial deshacer/rehacer) y
  `page.tsx` es el único puente hacia `useLocalStorage`, con escritura
  por contenido en las mismas 4 claves encriptadas.
- **Cero cambios de comportamiento:** es solo documentación.

**Commit:** incluido en el `+17`.

---

## 2026-10-03 — #11 Etapa A (reglas responsive) + #12 (ejecutable Windows construido y probado)

**Autorización del usuario:** *"#11 → Aprobar Etapa A (solo reglas)"*,
*"#12 → Sí, aprobar"* y *"avancemos hasta completar lo de electron y
luego comiteas"*.

### #11 — Etapa A: reglas UI/UX responsivas (`AGENTS.md`)

- Nueva sección **"📐 Diseño responsivo (reglas UI/UX)"** con 10 reglas:
  primero 360 px (escalas Tailwind `sm/md/lg/xl`), zonas de toque ≥ 44 px,
  fuentes de entrada ≥ 16 px (evita el zoom automático de iOS),
  navegación barra inferior/lateral con `safe-area`, cuadrículas de 1
  columna hacia arriba, topes de ancho en diálogos, `overflow-x-auto` en
  tablas, colores solo de variables OKLCH, orientación vertical y
  horizontal — más el protocolo de validación a **360/768/1024 px**
  (ventana redimensionada o celular por la red con `preview:network`).
- **Etapa B** (auditoría por vistas) y **Etapa C** (validación visual con
  el usuario) quedan **pendientes de aprobación** (pendiente #11 abierto).

### #12 — Ejecutable Windows

**Primer `npm run build:exe` → FALLÓ (4 intentos):**
`⨯ cannot execute … Cannot create symbolic link: El cliente no dispone
de un privilegio requerido` — el paquete `winCodeSign-2.6.0` contiene 2
enlaces simbólicos de macOS (`darwin/10.12/lib/libcrypto.dylib` y
`libssl.dylib`); Windows exige privilegio para crear enlaces y 7-Zip
(`-snld`) abortaba… **pese a que todo lo útil para Windows ya estaba
extraído** (`rcedit*.exe`, `windows-10/…/signtool.exe`).

**Diagnóstico (solo lectura):** leída la fuente de `app-builder`
(`pkg/download/artifactDownloader.go`): la caché solo valida que exista
la carpeta final `…\electron-builder\Cache\winCodeSign\winCodeSign-2.6.0`
(`CheckCache` → existe y es directorio → se salta descarga y extracción),
y la carpeta temporal del intento fallido estaba completa salvo los 2
enlaces de macOS (irrelevantes al compilar para Windows).

**Arreglo (fuera del proyecto, sin tocar Windows):** renombrar la
extracción parcial `335577279` → `winCodeSign-2.6.0` y borrar los restos
de los 4 intentos (carpetas temporales + `.7z`). Cero cambios de sistema
y cero cambios de código.

**Segundo build → EXIT 0:**

| Artefacto | Tamaño | Qué es |
|---|---|---|
| `dist-electron/Mis-Gastos-Setup.exe` | 233,3 MB | Instalador NSIS (oneClick no, permite elegir carpeta, accesos directos) |
| `dist-electron/Mis-Gastos.exe` | 233,1 MB | Portable (doble clic, sin instalación) |
| `Mis-Gastos-Setup.exe.blockmap` + `latest.yml` | — | Soporte de auto-update (electron-updater) |
| `win-unpacked/Mis Gastos.exe` | — | App sin empaquetar (misma prueba) |

**Pruebas del portable (2 lanzamientos):**

| Prueba | Resultado |
|---|---|
| Ventana | ✅ Título "Mis Gastos - Control de Gastos Mensuales" (× 2) |
| Puerto interno | ✅ `127.0.0.1` aleatorio (54929 → 57159); **3000/4000 jamás usados** (regla de puertos respetada) |
| HTTP interno | ✅ 200 × 2 con el HTML de la app |
| Cierre limpio (X de la ventana) | ✅ 0 procesos huérfanos y puerto liberado (× 2) |
| Perfil de datos | ✅ `%APPDATA%\mis-gastos` creado; `Local Storage/leveldb` pasó de **0 → 11.155 bytes** al cerrar con X |
| Auto-update | ✅ `.updaterId` generado; `latest.yml` + `blockmap` presentes |

**Hallazgo documentable:** `Stop-Process -Force` (cierre brusco) pierde
las escrituras pendientes (log = 0 bytes); el cierre con la **X de la
ventana sí persiste todo**. En la app de escritorio, cerrar la ventana
ES el cierre correcto — la regla de "no cerrar con X" aplica a los
servidores de `dev`/`preview` en la terminal, no a esta app.

**Pendiente visual (opcional, del lado del usuario):** abrir
`Mis-Gastos.exe`, crear un gasto, cerrar con X y reabrir para confirmar
el dato a la vista.

**Archivos tocados:** `AGENTS.md` (inicio rápido, piezas, FAQ),
`CAMBIOS.md`, `AGENT.MD`, `Prompt-Mis-Gastos.txt` (2 zonas, entrada
anterior de esta fecha). **Sin cambios en `src/`.**

**Commit:** `+17`.

## 2026-10-03 — Pendiente #11 cerrado: auditoría responsive, correcciones y validación visual (Etapas B y C)

### Contexto

La Etapa A (`+17`) dejó escritas las 10 reglas UI/UX en `AGENTS.md`.
Con la aprobación del orquestador ("sigue con todo el pendiente 11")
se ejecutaron la **Etapa B** (auditoría por vista + corrección de lo
evidente) y la **Etapa C** (validación visual con el usuario). El
alcance de las zonas de toque lo eligió el usuario en esa sesión:
**44 px solo por debajo de 1024 px** (celular/tablet); el escritorio
conserva su aspecto compacto actual.

### Cómo se auditió (Etapa B)

- **Método:** servidor `preview:network` en el puerto **4000** (ciclo
  completo: se lanzó → se usó → se cerrará → verificará libre) y un
  iframe del mismo origen redimensionado a **360 / 768 / 1024 px**, de
  modo que las media queries y `matchMedia` responden al ancho del
  iframe. **6 vistas × 3 anchos = 18 mediciones.**
- **Métricas por vista:** desbordamiento horizontal, elementos fuera de
  pantalla, botones/objetos táctiles < 44 px, inputs con fuente < 16 px,
  reserva inferior del contenido (`padding-bottom`), texto recortado.
- **Navegación entre vistas:** los clics sintéticos no cambiaban de
  vista y los reales exigían la ventana visible; se usó la invocación
  directa del manejador de navegación de React (solo eso — ninguna ruta
  de escritura de datos quedó al alcance de la auditoría).

### Hallazgos (3) y correcciones (10 archivos de `src/`)

| # | Hallazgo | Dónde | Corrección |
|---|---|---|---|
| 1 | **Tablet 768–1023 px:** `md:p-6` pisaba al `pb-24` → el fondo del contenido quedaba en 24 px con la barra inferior (64 px) encima: **el último contenido quedaba tapado** | `page.tsx` | Reserva repetida por escala: `pb-24 md:pb-24 lg:pb-8 xl:pb-10` |
| 2 | **Anti-zoom iOS con hueco:** los inputs bajaban a 14 px desde 768 px (`md:text-sm`) → en iPhone horizontal (844–932 px) iOS hacía zoom al enfocar | `ui/input.tsx` | `lg:text-sm` (16 px hasta 1024 px) + altura mínima 44 en móvil |
| 3 | **Zonas de toque:** botones de 28–36 px frente a la regla ≥ 44 px. Conteos a 360 px: Gastos 24 · Configuración 10 · Historial 10 · Resumen 7 · Registrar Pago 5 · Ingresos 3 | primitivos `ui/` + 4 botones sueltos | Ver detalle abajo |

**Correcciones del hallazgo 3** (todas con reversión `lg:` para que el
escritorio no cambie):

- `ui/button.tsx` — base con `min-h-11 min-w-11 lg:min-h-0 lg:min-w-0`:
  cubre todos los botones de la app (CTA "Registrar Pagos", X del aviso,
  iconos de fila, tamaños `h-7`/`h-8` incluidos — el mínimo gana sobre
  la altura fija y en escritorio vuelve al tamaño original).
- `ui/input.tsx` — altura mínima 44 en móvil.
- `ui/select.tsx` — disparador y **ítems del menú** a 44 en móvil.
- `ui/tabs.tsx` — lista `min-h-[50px] lg:min-h-0` y disparadores a 44
  (los ítems interiores pasan de ~29 px a 44).
- `ui/dropdown-menu.tsx` — ítems, casillas, radio y submenú a 44.
- `Dashboard.tsx` — desplegable "X pagos realizados".
- `UpdateManager.tsx` — chevron de detalles de actualización.
- `IncomeManager.tsx` — puntos de color del formulario.
- `Settings.tsx` — X de quitar categoría dentro del chip: 16 → 24 px.
  **Excepción documentada:** dentro de un chip no caben 44 px sin romper
  el chip; 24 px (altura del chip) es el máximo posible.

### Resultado de la re-auditoría (mismas 18 mediciones, tras `build`)

| Ancho | Resultado |
|---|---|
| **360 px** | ✅ 6/6 vistas: **0** táctiles < 44, **0** inputs < 16, reserva 96 px, sin desbordes horizontales ni elementos fuera de pantalla |
| **768 px** | ✅ 6/6 vistas: reserva **96 px** (antes 24 — hallazgo 1 corregido), **0** táctiles < 44, **0** inputs < 16, sin desbordes |
| **1024 px** | ✅ Comportamiento deseado: barra lateral visible, reserva 32 px, sin desbordes; conserva tamaños compactos e inputs a 14 px (decisión del usuario para escritorio) |

Comprobaciones complementarias: diálogos con tope
`w-full max-w-[calc(100%-2rem)]` + `sm:max-w-*` ✅ · no hay `<Table>`
(las listas ya son tarjetas) ✅ · los textos recortados detectados son
elipsis intencional de la clase `truncate` ✅ · el `grid-cols-2` de las
tarjetas KPI a 360 px (columnas de 155 px) no desborda ✅.

### Etapa C — validación visual

- **9 capturas presentadas al usuario:** las 6 vistas a 360 px, 2 a
  768 px (Resumen y Gastos) y 1 a 1024 px (escritorio con barra lateral).
- Nota honesta: el visor de capturas mezcló el orden de algunas
  imágenes entre mensajes (defecto de la herramienta de captura, no de
  la app). La evidencia válida son las **mediciones programáticas** de
  cada ancho (tabla anterior), que pasan todas.

### Verificación de datos (protocolo obligatorio tras navegar)

| Comprobación | Resultado |
|---|---|
| Las 3 claves cifradas presentes y con longitudes **byte idénticas** al baseline | ✅ `expenses` 4725 · `incomes` 73 · `payments` 537 |
| Desencriptación con validación de hash de integridad | ✅ correcta |
| Contenido = demo canónico | ✅ 10 gastos (total 3.409.900) · 1 pago (Alquiler 1.200.000) · ingresos `[]` (igual que `createDemoIncomes()`) |
| Cifras del dashboard iguales al baseline | ✅ "1 de 10 cumplidos · $2.209.900" (3.409.900 − 1.200.000) y "9 compromisos pendientes" |
| ¿La auditoría escribió datos? | ✅ **No.** Solo se invocó navegación; la app no escribe al cargar ni al navegar (comprobado con recarga: los IV quedan estables). Los IV del registro anterior habían rotado por un re-cifrado de contenido idéntico (el IV es aleatorio por diseño) sin pérdida de datos |

### Calidad

`npm run lint` → **0 errores, 0 avisos** · `npm run build` → OK con
tipos · `out/` regenerado y re-auditado.

**Archivos tocados:** `src/` (10): `app/page.tsx`, `Dashboard.tsx`,
`IncomeManager.tsx`, `Settings.tsx`, `UpdateManager.tsx`,
`ui/button.tsx`, `ui/input.tsx`, `ui/select.tsx`, `ui/tabs.tsx`,
`ui/dropdown-menu.tsx`. Documentos: `AGENTS.md`, `CAMBIOS.md`,
`AGENT.MD`.

**Commit:** `+18`.

---

*Proyecto original: Reivaj640 / Mis-Gastos-VSCode · Licencia MIT · Atribución conservada*
