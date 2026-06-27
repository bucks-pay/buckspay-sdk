import tseslint from "typescript-eslint";

export default tseslint.config(
  {
    // Test code is covered by `tsc` (strict) + the vitest runner, not eslint —
    // consistent across packages (most keep tests in an un-linted `test/` dir;
    // @buckspay/react colocates them in `src/`, hence the explicit test globs).
    ignores: [
      "**/dist/**",
      "**/node_modules/**",
      "**/coverage/**",
      "**/*.config.*",
      "scripts/**",
      "**/*.test.ts",
      "**/*.test.tsx",
      "**/test/**",
      "**/vitest.setup.ts"
    ]
  },
  ...tseslint.configs.strictTypeChecked,
  ...tseslint.configs.stylisticTypeChecked,
  {
    languageOptions: {
      parserOptions: {
        projectService: true,
        tsconfigRootDir: import.meta.dirname
      }
    },
    rules: {
      "@typescript-eslint/no-non-null-assertion": "error",
      "@typescript-eslint/consistent-type-imports": "error"
    }
  }
);
