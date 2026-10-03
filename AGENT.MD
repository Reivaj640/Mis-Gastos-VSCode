# AGENT.MD — Estado vivo del proyecto Mis Gastos

**Qué es esto:** el tablero de estado del proyecto. Se actualiza **al final
de cada sesión** con el usuario. Cualquier agente puede leerlo y saber en
2 minutos en qué queda todo.

**No confundir con:**
- `AGENTS.md` → ficha técnica del proyecto (estructura, reglas, comandos).
- `CAMBIOS.md` → registro histórico de qué se cambió y por qué.
- `Prompt-Mis-Gastos.txt` → reglas de trabajo permanentes (**léelo primero**).

---

## 📌 Última actualización

| | |
|---|---|
| **Fecha** | 2026-10-03 |
| **Sesión** | Prompt de Zustand corregido + #11 Etapa A (reglas responsive) + #12 ejecutable Windows construido y probado |
| **Estado** | ✅ Estable — todo guardado en Git |

### Qué se hizo en esta sesión
1. **`Prompt-Mis-Gastos.txt` corregido (autorizado):** los 2 lugares que
   decían que `useAppStore` "no está en uso activo" ahora describen el
   flujo real (desde el `+15`: vistas → store → `page.tsx` →
   `useLocalStorage`). Solo documentos.
2. **#11 Etapa A (solo reglas, autorizada):** nueva sección "📐 Diseño
   responsivo" en `AGENTS.md` con 10 reglas UI/UX táctiles + validación
   a 360/768/1024 px. Etapas B (auditoría por vistas) y C (validación
   visual) esperan aprobación → pendiente #11 queda **abierto**.
3. **#12 ejecutable Windows (autorizado):** el primer `build:exe` falló
   4 veces por la caché `winCodeSign` (2 enlaces de macOS piden
   privilegio de enlaces); se reparó la caché **renombrando la
   extracción parcial** al nombre final que valida `app-builder` (sin
   tocar Windows ni el código) → segundo build **EXIT 0**: instalador
   NSIS 233 MB + portable 233 MB + `blockmap`/`latest.yml`.
4. **Pruebas del portable:** ventana con título correcto × 2 · puerto
   interno aleatorio `127.0.0.1` (54929 → 57159, **nunca 3000/4000**) ·
   HTTP 200 × 2 · cierre con X = **0 procesos huérfanos y puerto
   liberado** × 2 · perfil `%APPDATA%\mis-gastos` con **11.155 bytes**
   persistidos en `Local Storage` · `.updaterId` (auto-update) creado.
5. **Hallazgo:** el cierre brusco (`Stop-Process`) pierde escrituras
   pendientes (log = 0 bytes); la **X de la ventana sí persiste todo**.
   En escritorio, cerrar con X ES el cierre correcto — la regla de "no
   cerrar con X" aplica a los servidores en terminal (dev/preview).
6. Commit `+17`.

### Sesiones anteriores
1. **#10** (`5075378`, `+16`): deuda de lint saldada — `npm run lint`
   83 → 0 sin ignorar nada en `src/`; `electron/`+`scripts/` con la
   regla `no-require-imports` apagada (CommonJS, justificada en
   `eslint.config.mjs`); tsc/build en 0; 5 vistas + export CSV probadas
   sin cambios de comportamiento.
2. **#6** (`1367d49`, `+15`): Zustand activo con deshacer/rehacer 1 a 1,
   persistencia en texto plano eliminada, integridad verificada byte a
   byte.
3. **#7 y #8** (`c54847f`, `+14`) + hito `+13` (`ec6880d`): build con
   tipos verificados, ESLint 9 funcionando → deuda #10.
4. Etapa 1 (`53e4b9c`), Etapa 2 service worker v3 (`9e04323`), regla de
   puertos y validación manual en 4000 (`fd8e9ce`, `8b5407e`) → detalle en
   `CAMBIOS.md`.
5. Solución de red guardada + creación de `AGENT.MD` → `99a561d`, `9ba8d8c`.

---

## ✅ Estado general

| Pieza | Estado | Notas |
|---|---|---|
| Compilación (`npm run build`) | ✅ Funciona | Con **verificación de tipos activa** (sin `ignoreBuildErrors`); genera carpeta `out/` |
| Verificación de tipos (`npx tsc --noEmit`) | ✅ Cero errores | Antes tenía 15 errores ocultos por #7 (resuelto) |
| App en este equipo (`npm run dev`) | ✅ Funciona | http://localhost:3000 |
| App por red (`npm run preview:network`) | ✅ Funciona | Puerto 4000, muestra la dirección sola. **Confirmado por el usuario** |
| Enlace al compartir (OpenGraph) | ✅ Corregido | `metadataBase` puesta; sin imágenes rotas |
| Revisión de errores (`npm run lint`) | ✅ Limpio | `eslint.config.mjs` (ESLint 9); **0 errores y 0 avisos** (deuda #10 saldada: 83 → 0) |
| Service worker (`public/sw.js` v3) | ✅ Corregido y probado | Primero la red (versión fresca) + copia sin conexión. Commit `9e04323` |
| Servidor Next huérfano (PID 23240) | ✅ Detenido | Puerto `::1:4000` liberado. **Regla nueva:** todo proceso = se lanza → ocupa el puerto → se cierra → desocupa. Sin puertos alternos |
| Instalador Windows (`npm run build:exe`) | ✅ Construido y probado | Instalador NSIS `Mis-Gastos-Setup.exe` (233 MB) + portable `Mis-Gastos.exe` (233 MB) + auto-update (`latest.yml`/`blockmap`); puerto interno aleatorio `127.0.0.1` (no toca 3000/4000); cierre con X = 0 huérfanos; datos en `%APPDATA%\mis-gastos` (11 KB persistidos). Requiere la caché `winCodeSign` reparada — ver `CAMBIOS.md` 2026-10-03 |
| Reglas responsive UI/UX (`AGENTS.md`) | ✅ Etapa A documentada (#11) | 10 reglas táctiles + validación a 360/768/1024 px; auditoría (Etapa B) y validación visual (Etapa C) pendientes de aprobación |
| Control de versiones (Git) | ✅ Activo | Rama `main`, **sin cambios sin guardar** |
| Deshacer/Rehacer (Zustand `useAppStore`) | ✅ Activo | Puente en `page.tsx`; 1 acción = 1 paso; botones flotantes + `Ctrl+Z`/`Ctrl+Y`; el historial se limpia al recargar |
| Datos del usuario | ✅ Intactos | Encriptados (AES-GCM); verificado **byte a byte**: cargar la versión nueva no escribe nada en las claves |
| Dependencias (`node_modules`) | ✅ Instaladas | 1100 paquetes |
| Node.js | ✅ v26.10.0 | Instalado por el usuario |

---

## 🕓 Historial de sesiones

| Fecha | Qué pasó | Commits |
|---|---|---|
| 2026-10-02 | Puesta en marcha: Git activado, prompt unificado, `CAMBIOS.md` creado. **Cero cambios en el código de la app** | `f68a431` → `7462bc4` → `6673a05` |
| 2026-10-02 | Arranque en Windows arreglado (`tee` eliminado) + diagnóstico del loop de carga por red | `5c87754`, `9575e0e` |
| 2026-10-02 | Solución de red guardada + creación de `AGENT.MD` | `99a561d`, `9ba8d8c` |
| 2026-10-02 | Evaluación de los 6 pendientes + Etapa 1 ejecutada (metadataBase, limpieza de comandos y sobras) | `53e4b9c`, `63a8077` |
| 2026-10-02 | Etapa 2: service worker v3 (primero la red + respaldo sin conexión), probado en navegador | `9e04323`, `3a22c1c` |
| 2026-10-02 | Regla de puertos + huérfano detenido + validación manual completa en 4000 | `fd8e9ce` + docs de validación |
| 2026-10-02 | Commit de hito `+13` + **#7 y #8 resueltos**: build con tipos verificados, ESLint 9 funcionando, 15 errores ocultos reparados | `ec6880d` (`+13`) + `+14` |
| 2026-10-02 | **#6 resuelto**: Zustand activo con deshacer/rehacer 1 a 1, persistencia en texto plano eliminada, integridad de datos verificada byte a byte | `+15` |
| 2026-10-02 | **#10 resuelto**: deuda de lint saldada — `lint` 83 → 0, `tsc` y `build` en verde, 5 vistas + export CSV probadas sin cambios de comportamiento | `+16` |
| 2026-10-03 | `Prompt-Mis-Gastos.txt` corregido (Zustand en uso desde `+15`) + reglas responsive (Etapa A #11) + ejecutable Windows construido y probado (#12; caché `winCodeSign` reparada) | `+17` |

**Punto de retorno al estado original de Javier:** `git checkout f68a431 -- .`

---

## ⚠️ Pendientes detectados (NO corregidos — requieren decisión)

**Prioridad según la última evaluación (2026-10-03):**

| # | Qué | Riesgo | Por qué quedó |
|---|---|---|---|
| 9 | ~~Servidor Next huérfano (PID 23240, `::1:4000`)~~ | — | ✅ **Resuelto:** detenido con aprobación del usuario; puerto 4000 verificado libre |
| 11 | Responsive: **Etapa B** (auditoría por vistas a 360/768/1024 px) + **Etapa C** (validación visual con el usuario) | Bajo — la base responsiva ya existe (breakpoints + bottom-nav + `safe-area`) | Etapa A ejecutada (+17): 10 reglas escritas en `AGENTS.md`; B y C esperan aprobación |

### Resueltos en esta sesión (2026-10-03, commit `+17`)

| # | Pendiente | Cómo quedó |
|---|---|---|
| 12 | Ejecutable Windows nunca probado (`build:exe` ⬜) | ✅ **Construido y probado:** reparada la caché `winCodeSign` (2 enlaces de macOS sin privilegio — renombrado de la extracción parcial, sin tocar Windows ni el código) → build 0 con instalador NSIS 233 MB + portable 233 MB + auto-update. Pruebas: ventana ✅ × 2 · puerto interno aleatorio `127.0.0.1` (nunca 3000/4000) ✅ · HTTP 200 × 2 ✅ · cierre con X = 0 huérfanos ✅ × 2 · **11.155 bytes persistidos** en `%APPDATA%\mis-gastos` ✅. Falta solo la prueba visual de datos del usuario (opcional) |

### Resueltos en la sesión anterior (2026-10-02, commit `+16`)

| # | Pendiente | Cómo quedó |
|---|---|---|
| 10 | **Deuda de lint:** 83 problemas (32 errores / 51 avisos) | ✅ **`npm run lint` = 0.** `electron/`+`scripts/`: regla `require` apagada solo ahí (CommonJS, justificada en la config). `src/`: ~50 imports/vars muertos quitados, 13 `any` con tipos reales, 4 `setState` en efecto con patrón canónico (`useSyncExternalStore` / inicialización diferida), ancho aleatorio en render → fijo; 1 `eslint-disable` documentado en `page.tsx`. Verificado: lint/tsc/build en 0, 5 vistas + CSV en navegador, datos byte idénticos |

### Resueltos hace dos sesiones (2026-10-02, commit `+15`)

| # | Pendiente | Cómo quedó |
|---|---|---|
| 6 | Zustand (`src/store/useAppStore.ts`) no estaba en uso | ✅ **Activo como puente** en `page.tsx`: vistas intactas; toda escritura pasa por el store (historial) y se guarda en las mismas 4 claves encriptadas. Corregidos 2 bugs latentes (el primer Ctrl+Z borraba todo / desfase de un paso), quitada la persistencia en texto plano `mis-gastos-storage`, botones + `Ctrl+Z`/`Ctrl+Y` |

### Resueltos hace tres sesiones (2026-10-02, commit `+14`)

| # | Pendiente | Cómo quedó |
|---|---|---|
| 7 | `next.config.ts` ignora errores de tipado (`ignoreBuildErrors: true`) | ✅ Quitado; reparados los **15 errores** que destapaba; `tsc --noEmit` = 0 y `build` en verde con la verificación corriendo de verdad |
| 8 | `npm run lint` siempre falla (sin configuración ESLint 9) | ✅ Creado `eslint.config.mjs` (formato plano, reglas oficiales Next 16); el comando corre y lista la deuda → #10 |

### Resueltos en la Etapa 2 (2026-10-02, commit `9e04323`)

| # | Pendiente | Cómo quedó |
|---|---|---|
| 1 | Service worker "primero la copia" | ✅ **v3:** primero la red en el camino normal + respaldo sin conexión/error 502; conserva la copia para actualizaciones oficiales. Probado en navegador: frescura ✅, sin conexión ✅ |

### Resueltos en la Etapa 1 (2026-10-02, commit `53e4b9c`)

| # | Pendiente | Cómo quedó |
|---|---|---|
| 2 | `metadataBase` + `og-image.png` inexistente | ✅ `metadataBase` puesta; referencia a la imagen rota quitada |
| 3 | `.env` con ruta de Javier | ✅ Borrado (no estaba en Git, nadie lo leía) |
| 4 | `npm run start` roto (bun/tee/Windows) | ✅ Comando eliminado |
| 5 | Comandos `db:*` sin `schema.prisma` + `db.ts` muerto | ✅ Comandos y documento eliminados |

---

## 📏 Cómo mantener este archivo (obligatorio para todo agente)

Al **final** de cada sesión con el usuario:

1. Actualiza la sección **Última actualización** (fecha, qué se hizo, estado).
2. Agrega la sesión al **Historial de sesiones** con su commit.
3. Revisa **Estado general**: ¿algo cambió de estado?
4. Mueve cosas de **Pendientes** a hecho (o agrega nuevas detecciones).
5. Registra el detalle completo en `CAMBIOS.md` y guarda todo en Git
   (`git add -A` + `git commit -m "mensaje en español"`).

> Si este archivo está desactualizado respecto a `git log`, **manda el Git**:
> la verdad siempre es el historial de commits.

---

*Documento de sesión · Mis Gastos · Fork de Reivaj640 (Javier) · Licencia MIT*
