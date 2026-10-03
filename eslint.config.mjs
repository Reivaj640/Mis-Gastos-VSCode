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
];

export default eslintConfig;
