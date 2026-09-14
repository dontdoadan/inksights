import js from "@eslint/js";
import eslintPluginPrettier from "eslint-plugin-prettier/recommended";
import globals from "globals";
import reactHooks from "eslint-plugin-react-hooks";
import reactRefresh from "eslint-plugin-react-refresh";
import tseslint from "typescript-eslint";

export default tseslint.config(
  { ignores: ["dist", ".output", ".vinxi"] },
  {
    extends: [js.configs.recommended, ...tseslint.configs.recommended],
    files: ["**/*.{ts,tsx}"],
    languageOptions: {
      ecmaVersion: 2020,
      globals: globals.browser,
    },
    plugins: {
      "react-hooks": reactHooks,
      "react-refresh": reactRefresh,
    },
    rules: {
      ...reactHooks.configs.recommended.rules,
      "no-restricted-imports": [
        "error",
        {
          paths: [
            {
              name: "server-only",
              message:
                "TanStack Start does not use the Next.js `server-only` package. Rename the module to `*.server.ts` or mark it with `@tanstack/react-start/server-only`.",
            },
          ],
        },
      ],
      "react-refresh/only-export-components": ["warn", { allowConstantExport: true }],
      "@typescript-eslint/no-unused-vars": "off",
    },
  },
  eslintPluginPrettier,
  {
    // Formatting remains available through `npm run format`, but is intentionally
    // not a correctness gate while the repository carries a large legacy
    // formatting backlog unrelated to this remediation.
    rules: {
      "prettier/prettier": "off",
    },
  },
  {
    // Narrow legacy exceptions that pre-date the sandbox remediation. Keeping
    // them scoped avoids disabling these correctness rules for new code.
    files: ["src/integrations/supabase/previewAuthStorage.ts"],
    rules: { "prefer-const": "off" },
  },
  {
    files: ["src/routes/studio-growth-check.tsx"],
    rules: { "@typescript-eslint/no-explicit-any": "off" },
  },
  {
    files: ["supabase/functions/public-contact-intake/index.ts"],
    rules: { "no-control-regex": "off" },
  },
  {
    files: ["supabase/functions/search-intelligence-v1/index.ts"],
    rules: { "no-empty": "off" },
  },
);
