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
| **Fecha** | 2026-10-02 |
| **Sesión** | Etapa 2: service worker corregido y probado (pendiente #1 resuelto) |
| **Estado** | ✅ Estable — todo guardado en Git |

### Qué se hizo en esta sesión
1. **Etapa 1** (aprobada): `metadataBase` +, se quitó la referencia a
   `og-image.png` inexistente, se borraron comando `start`, comandos `db:*`,
   `src/lib/db.ts` y `.env` → commit `53e4b9c` · docs `63a8077`.
2. **Etapa 2** (aprobada): `public/sw.js` v2 → v3 — *"primero la red"* en el
   camino normal (versión siempre fresca) y *"primero la copia"* solo para
   actualizaciones oficiales; respaldo de copia ante error 502/503 → commit `9e04323`.
3. **Pruebas en navegador real:** frescura ✅ · carga normal ✅ · **app completa
   con el servidor apagado** ✅ · build ✅.
4. Detectado: servidor Next huérfano (PID 23240, `::1:4000`, de la sesión
   anterior) — **no tocado, pendiente de decisión**.

### Sesiones anteriores
1. Solución de red guardada + creación de `AGENT.MD` → `99a561d`, `9ba8d8c`.

---

## ✅ Estado general

| Pieza | Estado | Notas |
|---|---|---|
| Compilación (`npm run build`) | ✅ Funciona | Sin errores y **sin avisos** (6.3 s), genera carpeta `out/` |
| App en este equipo (`npm run dev`) | ✅ Funciona | http://localhost:3000 |
| App por red (`npm run preview:network`) | ✅ Funciona | Puerto 4000, muestra la dirección sola. **Confirmado por el usuario** |
| Enlace al compartir (OpenGraph) | ✅ Corregido | `metadataBase` puesta; sin imágenes rotas |
| Revisión de errores (`npm run lint`) | ⚠️ No funciona | Nunca funcionó: falta la configuración de ESLint 9 → pendiente #8 |
| Service worker (`public/sw.js` v3) | ✅ Corregido y probado | Primero la red (versión fresca) + copia sin conexión. Commit `9e04323` |
| Servidor Next huérfano (PID 23240) | ⚠️ Ajeno | Escucha en `::1:4000` desde la sesión anterior; interfiere con `localhost:4000`. **No tocar sin decisión del usuario** |
| Instalador Windows (`npm run build:exe`) | ⬜ No probado en esta sesión | Genera `.exe` en `dist-electron/` |
| Control de versiones (Git) | ✅ Activo | Rama `main`, **sin cambios sin guardar** |
| Datos del usuario | ✅ Intactos | Encriptados en el navegador (AES-GCM), no se tocaron |
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
| 2026-10-02 | Etapa 2: service worker v3 (primero la red + respaldo sin conexión), probado en navegador | `9e04323` |

**Punto de retorno al estado original de Javier:** `git checkout f68a431 -- .`

---

## ⚠️ Pendientes detectados (NO corregidos — requieren decisión)

**Prioridad según la última evaluación (2026-10-02):**

| # | Qué | Riesgo | Por qué quedó |
|---|---|---|---|
| 6 | Zustand (`src/store/useAppStore.ts`) no está en uso | Nulo | Reservado por el prompt para el futuro "deshacer/rehacer". **No borrar** |
| 7 | `next.config.ts` ignora errores de tipado (`ignoreBuildErrors: true`) | Medio a futuro | Heredado del original. Un error de tipo pasaría desapercibido en el build |
| 8 | `npm run lint` siempre falla | Bajo | Falta la configuración de ESLint 9 (`eslint.config.*`). Ojo: `AGENTS.md` decía que funcionaba — ya quedó corregido |
| 9 | Servidor Next huérfano (PID 23240, `::1:4000`) | Bajo-medio | De la sesión anterior (19:57). Captura `localhost:4000` antes que `preview:network`. **Matar solo con decisión del usuario** |

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
