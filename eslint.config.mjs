import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

// Architecture boundaries (see README "Struktur proyek"):
// - only services/ and features/*/services/ talk to the HTTP client;
// - shared layers (components, hooks, lib, store, config, types) never depend on a feature;
// - features are used through their barrel (`@/features/<name>`), never their internals.
const httpClient = {
  name: "@/services/api-client",
  importNames: ["api", "withQuery"],
  message: "Panggil API lewat service fitur (features/<nama>/services) dan hook-nya, bukan dari sini.",
};
const featureInternals = {
  group: ["@/features/*/*"],
  message: "Impor fitur lewat barrel-nya: @/features/<nama>.",
};
const anyFeature = {
  group: ["@/features", "@/features/*"],
  message: "Lapisan shared tidak boleh bergantung pada fitur.",
};

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  {
    files: ["src/app/**", "src/features/*/components/**", "src/features/*/hooks/**"],
    rules: {
      "no-restricted-imports": ["error", { paths: [httpClient], patterns: [featureInternals] }],
    },
  },
  {
    files: ["src/features/*/services/**", "src/features/*/*.ts"],
    rules: { "no-restricted-imports": ["error", { patterns: [featureInternals] }] },
  },
  {
    files: ["src/components/**", "src/hooks/**", "src/lib/**", "src/store/**", "src/config/**", "src/types/**"],
    rules: { "no-restricted-imports": ["error", { paths: [httpClient], patterns: [anyFeature] }] },
  },
  {
    files: ["src/services/**"],
    rules: { "no-restricted-imports": ["error", { patterns: [anyFeature] }] },
  },
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
  ]),
]);

export default eslintConfig;
