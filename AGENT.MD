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
| **Sesión** | #11 cerrado: auditoría responsive a 360/768/1024 px + correcciones (Etapas B y C) |
| **Estado** | ✅ Estable — todo guardado en Git |

### Qué se hizo en esta sesión
1. **#11 Etapa B (auditoría + correcciones, autorizada):** 6 vistas ×
   3 anchos (360/768/1024 px) medidas con un iframe del mismo origen =
   18 mediciones. **3 hallazgos corregidos en 10 archivos de `src/`:**
   ① 768 px — `md:p-6` pisaba al `pb-24` y dejaba solo 24 px de fondo
   con la barra inferior encima (último contenido tapado) → reserva
   `pb-24 md:pb-24 lg:pb-8 xl:pb-10`; ② anti-zoom iOS — los inputs
   bajaban a 14 px desde 768 px → `lg:text-sm`; ③ zonas de toque de
   28–36 px → **44 px solo por debajo de 1024 px** (alcance elegido por
   el usuario; escritorio compacto intacto) en los primitivos `ui/`
   (button, input, select, tabs, dropdown-menu) + 4 botones sueltos
   (Dashboard, UpdateManager, IncomeManager, Settings). Excepción: la X
   dentro del chip de categoría = 24 px.
2. **Re-auditoría tras `build`:** 360 y 768 → **0** táctiles < 44, **0**
   inputs < 16, reserva 96 px, sin desbordes (6/6 vistas); 1024 →
   barra lateral, reserva 32 px y tamaños compactos (comportamiento
   deseado). `lint` 0/0 y `build` OK.
3. **#11 Etapa C (validación visual):** 9 capturas presentadas al
   usuario (6 vistas a 360 px, 2 a 768 px, 1 a 1024 px con barra
   lateral).
4. **Datos verificados tras navegar:** longitudes byte idénticas al
   baseline (4725/73/537), desencriptación con hash de integridad
   correcto, contenido = demo canónico (10 gastos / 1 pago / ingresos
   vacíos) y cifras del dashboard iguales. Los IV del registro anterior
   habían rotado (IV aleatorio por diseño) **sin cambio de contenido**;
   la app no escribe al cargar ni al navegar (comprobado con recarga).
5. Commit `+18` — con esto **el tablero queda sin pendientes
   abiertos** (los 12 originales + #9 están resueltos).

### Sesiones anteriores
1. **+17** (`a99dfb8`): `Prompt-Mis-Gastos.txt` corregido (Zustand en
   uso desde `+15`), #11 Etapa A (las 10 reglas responsive en
   `AGENTS.md`) y #12 ejecutable Windows construido y probado (caché
   `winCodeSign` reparada renombrando la extracción parcial; instalador
   NSIS + portable de 233 MB; puerto interno aleatorio `127.0.0.1`;
   cierre con X = 0 huérfanos; hallazgo: `Stop-Process` pierde
   escrituras — en escritorio, cerrar con X ES el cierre correcto).
2. **#10** (`5075378`, `+16`): deuda de lint saldada — `npm run lint`
   83 → 0 sin ignorar nada en `src/`; `electron/`+`scripts/` con la
   regla `no-require-imports` apagada (CommonJS, justificada en
   `eslint.config.mjs`); tsc/build en 0; 5 vistas + export CSV probadas
   sin cambios de comportamiento.
3. **#6** (`1367d49`, `+15`): Zustand activo con deshacer/rehacer 1 a 1,
   persistencia en texto plano eliminada, integridad verificada byte a
   byte.
4. **#7 y #8** (`c54847f`, `+14`) + hito `+13` (`ec6880d`): build con
   tipos verificados, ESLint 9 funcionando → deuda #10.
5. Etapa 1 (`53e4b9c`), Etapa 2 service worker v3 (`9e04323`), regla de
   puertos y validación manual en 4000 (`fd8e9ce`, `8b5407e`) → detalle en
   `CAMBIOS.md`.
6. Solución de red guardada + creación de `AGENT.MD` → `99a561d`, `9ba8d8c`.

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
| Auditoría responsive UI/UX (`AGENTS.md`) | ✅ **#11 cerrado** (A + B + C) | 10 reglas + auditoría real a 360/768/1024 px (18 mediciones, 6 vistas) + correcciones en 10 archivos + validación visual con capturas. Resultado: 0 táctiles < 44 y 0 inputs < 16 en móvil/tablet, sin desbordes, fondo de tablet corregido |
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
| 2026-10-03 | **#11 cerrado**: auditoría responsive 360/768/1024 px × 6 vistas (18 mediciones) + 3 correcciones en 10 archivos (fondo de tablet, anti-zoom iOS, zonas de toque 44 px en móvil/tablet) + re-auditoría en verde + 9 capturas de validación visual + datos verificados byte a byte | `+18` |

**Punto de retorno al estado original de Javier:** `git checkout f68a431 -- .`

---

## ⚠️ Pendientes detectados (NO corregidos — requieren decisión)

**Sin pendientes abiertos (2026-10-03).** Los 12 pendientes originales
más el huérfano #9 están resueltos (detalle en los bloques de abajo).
El último en cerrarse fue el **#11** (commit `+18`).

### Resueltos en esta sesión (2026-10-03, commit `+18`)

| # | Pendiente | Cómo quedó |
|---|---|---|
| 11 | Responsive: **Etapa B** (auditoría por vistas a 360/768/1024 px + corrección) y **Etapa C** (validación visual con el usuario) | ✅ **Cerrado:** 18 mediciones (6 vistas × 3 anchos) con un iframe del mismo origen; 3 hallazgos corregidos en 10 archivos de `src/` — ① fondo de tablet 768–1023 px (el `md:p-6` pisaba al `pb-24`) → reserva `pb-24 md:pb-24 …`; ② anti-zoom iOS → inputs `lg:text-sm`; ③ zonas de toque 28–36 px → **44 px solo por debajo de 1024 px** (alcance elegido por el usuario; excepción: X de chip = 24 px). Re-auditoría en verde: 0 táctiles < 44, 0 inputs < 16, sin desbordes, reservas 96/96/32 px. 9 capturas presentadas (Etapa C). Datos byte idénticos (4725/73/537; IVs aleatorios sin cambio de contenido). Detalle en `CAMBIOS.md` |

### Resueltos en la sesión anterior (2026-10-03, commit `+17`)

| # | Pendiente | Cómo quedó |
|---|---|---|
| 12 | Ejecutable Windows nunca probado (`build:exe` ⬜) | ✅ **Construido y probado:** reparada la caché `winCodeSign` (2 enlaces de macOS sin privilegio — renombrado de la extracción parcial, sin tocar Windows ni el código) → build 0 con instalador NSIS 233 MB + portable 233 MB + auto-update. Pruebas: ventana ✅ × 2 · puerto interno aleatorio `127.0.0.1` (nunca 3000/4000) ✅ · HTTP 200 × 2 ✅ · cierre con X = 0 huérfanos ✅ × 2 · **11.155 bytes persistidos** en `%APPDATA%\mis-gastos` ✅. Falta solo la prueba visual de datos del usuario (opcional) |

### Resueltos hace dos sesiones (2026-10-02, commit `+16`)

| # | Pendiente | Cómo quedó |
|---|---|---|
| 10 | **Deuda de lint:** 83 problemas (32 errores / 51 avisos) | ✅ **`npm run lint` = 0.** `electron/`+`scripts/`: regla `require` apagada solo ahí (CommonJS, justificada en la config). `src/`: ~50 imports/vars muertos quitados, 13 `any` con tipos reales, 4 `setState` en efecto con patrón canónico (`useSyncExternalStore` / inicialización diferida), ancho aleatorio en render → fijo; 1 `eslint-disable` documentado en `page.tsx`. Verificado: lint/tsc/build en 0, 5 vistas + CSV en navegador, datos byte idénticos |

### Resueltos hace tres sesiones (2026-10-02, commit `+15`)

| # | Pendiente | Cómo quedó |
|---|---|---|
| 6 | Zustand (`src/store/useAppStore.ts`) no estaba en uso | ✅ **Activo como puente** en `page.tsx`: vistas intactas; toda escritura pasa por el store (historial) y se guarda en las mismas 4 claves encriptadas. Corregidos 2 bugs latentes (el primer Ctrl+Z borraba todo / desfase de un paso), quitada la persistencia en texto plano `mis-gastos-storage`, botones + `Ctrl+Z`/`Ctrl+Y` |

### Resueltos hace cuatro sesiones (2026-10-02, commit `+14`)

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
