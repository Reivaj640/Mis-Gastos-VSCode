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

### 2) Loop de carga al abrir por la dirección de red — EN INVESTIGACIÓN

**Síntoma:** al abrir `http://192.168.1.6:3000` desde otro equipo, la
aplicación se queda en "Cargando Mis Gastos" para siempre. En Visual
Studio Code sí funciona. También falla en ventana de incógnito.

**Primera hipótesis (DESCARTADA):** el service worker `public/sw.js`.
Se probó en ventana privada, que no usa copias guardadas, y el problema
sigue. Por lo tanto **no es el service worker**.

> Nota: el service worker sigue siendo un riesgo latente (guarda copia
> vieja en modo "primero la caché"), pero **no es la causa** de este
> problema. Se deja anotado para más adelante, no se toca ahora.

**Lo que sí se comprobó:**

| Comprobación | Resultado |
|---|---|
| El servidor responde en `localhost:3000` | ✅ HTTP 200, 18.186 bytes |
| El servidor responde en `192.168.1.6:3000` | ✅ HTTP 200, 18.186 bytes |
| La página include referencias a sus archivos de código | ✅ 72 referencias |
| El código de arranque puede quedarse colgado | ❌ Imposible: siempre termina |

**Hallazgo clave:** se revisó el código a fondo y **no existe forma de que
la aplicación se quede esperando**. La pantalla de carga desaparece en
menos de un segundo, siempre. Que se quede congelada significa que
**el navegador nunca llegó a ejecutar el código de la página**.

**Causa más probable: el navegador está bloqueando el código.**
En la captura del usuario se observa que el navegador usado es **Brave**
y que su escudo de seguridad muestra un **"2" rojo**, que es la señal de
"2 elementos bloqueados". La página se ve, pero su código no.

La dirección `192.168.1.6:3000` no es segura (no usa candado) porque es
HTTP, y los navegadores con protección extra bloquean con más facilidad
el código en ese tipo de direcciones.

**Prueba pendiente:** abrir la misma dirección en **Google Chrome** o
**Microsoft Edge** y confirmar si ahí sí carga.

**Pendiente de tu autorización:** según el resultado de esa prueba, se
decide la solución (probablemente ninguno de los dos navegadores con
protección, o desactivar la protección solo para esa dirección).

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

*Proyecto original: Reivaj640 / Mis-Gastos-VSCode · Licencia MIT · Atribución conservada*
