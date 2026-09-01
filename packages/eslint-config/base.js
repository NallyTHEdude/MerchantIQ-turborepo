import js from "@eslint/js";
import eslintConfigPrettier from "eslint-config-prettier";
import onlyWarn from "eslint-plugin-only-warn";
import turboPlugin from "eslint-plugin-turbo";
import tseslint from "typescript-eslint";

/**
 * A shared ESLint configuration for the repository.
 *
 * @type {import("eslint").Linter.Config[]}
 * */
export const config = [
  js.configs.recommended,
  eslintConfigPrettier,
  ...tseslint.configs.recommendedTypeChecked,
  {
    languageOptions: {
      parserOptions: {
        projectService: true,
        // Falls back to process.cwd() if omitted — fine as long as
        // ESLint runs with cwd inside the consuming package (Turborepo
        // does this by default). If you ever lint from the repo root
        // instead, each package's own eslint.config.js should set
        // tsconfigRootDir: import.meta.dirname to be safe.
      },
    },
    plugins: {
      turbo: turboPlugin,
    },
    rules: {
      "turbo/no-undeclared-env-vars": "warn",

      // --- Correctness / footguns, universal across the repo ---
      eqeqeq: ["error", "always", { null: "ignore" }],
      "no-var": "error",
      "prefer-const": "error",
      curly: ["error", "all"],
      "no-implicit-coercion": "error",
      "no-duplicate-imports": "error",
      "no-console": ["warn", { allow: ["warn", "error", "log"] }],

      // --- TS discipline ---
      "@typescript-eslint/no-explicit-any": "warn",
      "@typescript-eslint/no-non-null-assertion": "warn",
      "@typescript-eslint/no-shadow": "error",
      "no-shadow": "off",
      "@typescript-eslint/consistent-type-imports": [
        "warn",
        { prefer: "type-imports", fixStyle: "inline-type-imports" },
      ],

      // --- Async / Promise safety (needs the type-aware config above) ---
      "@typescript-eslint/no-floating-promises": "error",
      "@typescript-eslint/no-misused-promises": "error",
      "@typescript-eslint/await-thenable": "error",
      "@typescript-eslint/return-await": ["error", "in-try-catch"],
    },
  },
  {
    plugins: {
      onlyWarn,
    },
  },
  {
    ignores: ["dist/**", "build/**", "coverage/**", "node_modules/**"],
  },
];

export default config;
