import { defineConfig, configDefaults } from "vitest/config";
import tsconfigPaths from "vite-tsconfig-paths";

export default defineConfig({
  plugins: [tsconfigPaths()],
  test: {
    globals: true,
    exclude: [...configDefaults.exclude, ".claude/**"],
    coverage: {
      thresholds: { statements: 68, branches: 61, functions: 68, lines: 70 },
    },
  },
});
