// Configuración de ESLint 9 (formato plano) — pendiente #8 de AGENT.MD
// Creada para que `npm run lint` funcione: ESLint 9 ya no lee .eslintrc.
// Reglas oficiales de Next.js + TypeScript, sin nada nuevo ni personalizado.
import coreWebVitals from "eslint-config-next/core-web-vitals";
import typescript from "eslint-config-next/typescript";

const eslintConfig = [
  {
    ignores: [
      ".next/**",
      "out/**",
      "dist/**",
      "dist-electron/**",
      "node_modules/**",
    ],
  },
  ...coreWebVitals,
  ...typescript,
  // Herramientas Node/Electron en CommonJS: ahí `require()` ES la forma
  // correcta de importar (proceso principal de Electron, preload, y
  // scripts `.cjs`/de Node). La regla `no-require-imports` es de estilo
  // web/ESM y aquí sería un falso positivo — pendiente #10.
  {
    files: ["electron/**/*.js", "scripts/**/*.js", "scripts/**/*.cjs", "**/*.cjs"],
    rules: {
      "@typescript-eslint/no-require-imports": "off",
    },
  },
];

export default eslintConfig;
