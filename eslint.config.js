import tseslint from "typescript-eslint";
import sonarjs from "eslint-plugin-sonarjs";

export default tseslint.config(
  {
    ignores: [
      "build/**",
      ".react-router/**",
      "drizzle/**",
      "node_modules/**",
      ".claude/**",
    ],
  },
  {
    files: ["app/routes/**/*.{ts,tsx}"],
    ignores: ["**/*.test.*"],
    languageOptions: { parser: tseslint.parser },
    plugins: { sonarjs },
    rules: { "sonarjs/no-duplicate-string": ["error", { threshold: 3 }] },
  }
);
