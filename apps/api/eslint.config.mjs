import expressConfig from "@repo/eslint-config/express";

export default [
  ...expressConfig,
  {
    ignores: ["eslint.config.mjs", "drizzle.config.ts"],
  },
];
