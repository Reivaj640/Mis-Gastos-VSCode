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
| **Sesión** | Guardar en Git la solución de red + crear este archivo |
| **Estado** | ✅ Estable — sin cambios pendientes de guardar |

### Qué se hizo en esta sesión
1. Se revisó el estado del proyecto (rama `main`, 6 commits, sin errores).
2. Se guardó en Git el trabajo de la sesión anterior que quedó **sin commit**
   → commit `99a561d` — "Solucionar carga por red local con comando preview:network".
3. Se creó este archivo `AGENT.MD`.

---

## ✅ Estado general

| Pieza | Estado | Notas |
|---|---|---|
| Compilación (`npm run build`) | ✅ Funciona | Sin errores, genera carpeta `out/` |
| App en este equipo (`npm run dev`) | ✅ Funciona | http://localhost:3000 |
| App por red (`npm run preview:network`) | ✅ Funciona | Puerto 4000, muestra la dirección sola. **Confirmado por el usuario** |
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
| 2026-10-02 | Solución de red aplicada y verificada (guardada en esta sesión) + creación de `AGENT.MD` | `99a561d` |

**Punto de retorno al estado original de Javier:** `git checkout f68a431 -- .`

---

## ⚠️ Pendientes detectados (NO corregidos — requieren decisión)

Ordenados por importancia. **Ninguno afecta el funcionamiento actual.**

| # | Qué | Por qué quedó |
|---|---|---|
| 1 | Service worker `public/sw.js` usa "primero la caché" | Puede mostrar una versión vieja de la app. Riesgo latente, no causó el problema de red. Requiere autorización para tocarlo |
| 2 | Falta `metadataBase` en los datos de la página | Aviso menor de compilación: solo afecta cómo se ven los enlaces al compartir en redes sociales |
| 3 | Archivo `.env` tiene una ruta del computador de Javier | No causa problemas (la app no usa esa base de datos). Limpieza futura |
| 4 | Comando `npm run start` usa `tee` y `bun` | Igual que el antiguo `dev`: no funciona en Windows. **No se usa** — la app se abre con `dev` o `preview:network` |
| 5 | Comandos `db:*` (Prisma) sobran | La app no usa base de datos (todo va en el navegador). Sobran del proyecto original |
| 6 | Zustand (`src/store/useAppStore.ts`) no está en uso | Existe pero las vistas usan `useLocalStorage`. **No lo uses como si gobernara el estado** |

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
