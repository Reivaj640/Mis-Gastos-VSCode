# 💰 Mis Gastos - Control Inteligente de Finanzas Personales

[![Versión](https://img.shields.io/badge/versión-2.1.3-blue.svg)](https://github.com/Reivaj640/Mis-Gastos-VSCode/releases/tag/v2.1.3)
[![Tecnología](https://img.shields.io/badge/Next.js-16-black?logo=next.js)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-19-61dafb?logo=react)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-3178c6?logo=typescript)](https://www.typescriptlang.org/)
[![Seguridad](https://img.shields.io/badge/Seguridad-AES--GCM-green)](#)
[![Licencia](https://img.shields.io/badge/licencia-MIT-green.svg)](LICENSE)

> **Tu asistente financiero personal, seguro y privado.** Gestiona tus gastos, ingresos y pagos recurrentes directamente desde tu navegador sin enviar tus datos a ningún servidor.

---

## 📖 ¿Qué es Mis Gastos?

**Mis Gastos** es una aplicación web moderna (PWA) diseñada para el control financiero personal. A diferencia de otras apps que almacenan tu información en la nube, esta aplicación prioriza tu **privacidad**: todos los datos se guardan encriptados localmente en tu dispositivo.

Utiliza un stack tecnológico de vanguardia (**Next.js 16, React 19, TailwindCSS v4**) para ofrecer una experiencia fluida, rápida y visualmente atractiva.

### 🎯 ¿Para qué sirve?
- 📊 **Visualizar tu economía:** Dashboard interactivo con resumen de gastos vs. ingresos.
- 🔔 **Alertas de vencimiento:** Notificaciones visuales sobre pagos próximos o atrasados.
- 🔒 **Privacidad Total:** Tus datos financieros nunca salen de tu dispositivo.
- 📱 **Multi-dispositivo:** Funciona como app nativa en móviles y escritorio (PWA).
- 💾 **Backup Seguro:** Exporta e importa tus datos con encriptación AES-GCM.

---

## 🚀 Características Principales (v2.1)

### 📐 Layout Adaptativo (Full-Width)
- **Sin límite de ancho artificial:** El contenido aprovecha todo el espacio disponible de la pantalla en escritorio.
- **Resumen en 3 columnas (XL):** Compromisos del Mes ∥ Saldos por Responsable ∥ Pagos Realizados.
- **Listas en 2 columnas (XL):** Gastos e Historial de pagos en grid para maximizar el uso del espacio.
- **Ingresos en grid (XL):** Saldos por responsable distribuidos en 3 tarjetas por fila.
- **Formularios en filas:** Registrar Pago organiza Monto/Fecha/Período en una fila e Ingreso/Notas en otra (LG+).
- **Configuración en 2 columnas (XL):** Tarjetas de ajustes emparejadas en paralelo.
- **Totalmente responsivo:** En móvil y tablet todo se mantiene en una sola columna con bottom-nav.

### 🔐 Seguridad de Grado Militar
- **Encriptación AES-GCM:** Todos los datos se encriptan antes de guardarse en el navegador.
- **Sanitización XSS:** Protección contra inyección de scripts maliciosos en nombres y notas.
- **Validación de Integridad:** Detección automática de datos corruptos o manipulados.

### ⚡ Rendimiento Optimizado
- **Virtualización de Listas:** Manejo fluido de miles de registros sin lentitud.
- **Memoización Granular:** Cálculos inteligentes que evitan renderizados innecesarios.
- **Carga Instantánea:** Skeleton loaders y estados vacíos optimizados.

### 🎨 Experiencia de Usuario (UX)
- **Búsqueda Avanzada:** Filtra por monto, fechas, categorías y estados.
- **Modo Oscuro/Claro:** Adaptable a tus preferencias visuales.
- **Accesibilidad (A11y):** Navegable por teclado y compatible con lectores de pantalla.
- **Responsive Design:** Se adapta perfectamente a móviles, tablets y escritorios.

---

## 🛠️ Tecnologías Utilizadas

| Categoría | Tecnologías |
|-----------|-------------|
| **Core** | Next.js 16, React 19, TypeScript 5 |
| **Estilos** | TailwindCSS v4, Shadcn/ui, Framer Motion |
| **Estado** | Zustand (Gestión global), LocalStorage Encriptado |
| **Utilidades** | Date-fns, Lucide React (Íconos), clsx, tailwind-merge |
| **Seguridad** | Web Crypto API (Nativo del navegador) |
| **Build** | Turbopack, ESLint, Prettier |

---

## 📦 Instalación y Uso

### 1. Prerrequisitos
Asegúrate de tener instalado:
- [Node.js](https://nodejs.org/) (v20 o superior recomendado)
- npm, yarn o pnpm

### 2. Clonar el repositorio
```bash
git clone https://github.com/Reivaj640/Mis-Gastos-VSCode.git
cd Mis-Gastos-VSCode
```

### 3. Instalar dependencias
```bash
npm install
```

### 4. Ejecutar en desarrollo
```bash
npm run dev
```
Abre http://localhost:3000 en tu navegador.

### 5. Construir para producción
```bash
npm run build
```

---

## 💡 Cómo Usar la Aplicación

### 1. Primer Inicio
Al abrir la app por primera vez, se generará una clave de encriptación única en tu navegador. No necesitas registrarte ni crear cuenta.

### 2. Agregar Gastos e Ingresos
1. Ve a la sección "Gastos" o "Ingresos".
2. Haz clic en el botón "+" o "Nuevo".
3. Completa el formulario (Nombre, Monto, Día de vencimiento, Categoría).

> **Tip:** Usa categorías personalizadas para mayor detalle.

### 3. Registrar Pagos
1. Cuando pagues un gasto, ve a "Registrar Pago" o al dashboard.
2. Selecciona el gasto (o usa Pago Múltiple para pagar varios a la vez).
3. El sistema actualizará automáticamente tus estadísticas.

### 4. Copia de Seguridad (Backup)

> ⚠️ **Importante:** Como los datos son locales, si borras el caché del navegador, perderás la información si no tienes backup.

1. Ve a **Configuración > Exportar Respaldo (JSON)**.
2. Guarda el archivo `.json` en un lugar seguro (Google Drive, USB, etc.).
3. Para restaurar: **Importar Respaldo** y selecciona tu archivo.

---

## 🔒 Consideraciones de Seguridad y Privacidad

- **Datos Locales:** La aplicación usa localStorage del navegador. Si usas modo incógnito, los datos se borrarán al cerrar la pestaña.
- **Encriptación:** Aunque los datos están encriptados, evita usar la app en computadoras públicas o compartidas.
- **Responsabilidad:** El usuario es responsable de realizar copias de seguridad periódicas. Los desarrolladores no tienen acceso a tus datos ni pueden recuperarlos si se pierden.

---

## 🤝 Contribuciones

¡Las contribuciones son bienvenidas! Si encuentras un bug o tienes una idea de mejora:

1. Haz un Fork del proyecto.
2. Crea una rama para tu feature (`git checkout -b feature/AmazingFeature`).
3. Commit de tus cambios (`git commit -m 'Add some AmazingFeature'`).
4. Push a la rama (`git push origin feature/AmazingFeature`).
5. Abre un Pull Request.

Por favor, lee las guías de contribución antes de empezar.

---

## 📄 Licencia

Este proyecto está bajo la Licencia MIT. Consulta el archivo LICENSE para más detalles.

---

## 📬 Contacto

¿Tienes dudas o sugerencias?

- 📧 **Email:** adminkair@gmail.com
- 🐛 **Issues:** [GitHub Issues](https://github.com/Reivaj640/Mis-Gastos-VSCode/issues)

<div align="center">
<sub>Hecho con ❤️ por Reivaj</sub>
<br>
<small>Mejorando la salud financiera de uno a la vez.</small>
</div>
