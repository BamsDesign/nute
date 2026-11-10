import { dirname } from "path";
import { fileURLToPath } from "url";
import { FlatCompat } from "@eslint/eslintrc";

const compat = new FlatCompat({ baseDirectory: dirname(fileURLToPath(import.meta.url)) });

export default [
  ...compat.extends("next/core-web-vitals", "next/typescript"),
  // Les images sont optimisées au téléversement (WebP + miniature, srcset) : <img> est volontaire.
  { rules: { "@next/next/no-img-element": "off", "@typescript-eslint/no-unused-vars": ["warn", { varsIgnorePattern: "^_", argsIgnorePattern: "^_" }] } },
  { ignores: [".next/**", "node_modules/**", "storage/**"] },
];
