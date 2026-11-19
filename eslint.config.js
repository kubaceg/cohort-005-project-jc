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
    rules: {
      "sonarjs/no-duplicate-string": ["error", { threshold: 3 }],
      "max-lines": ["error", { max: 1700 }],
    },
  },
  {
    files: ["app/**/*.{ts,tsx}"],
    languageOptions: { parser: tseslint.parser },
    plugins: { "@typescript-eslint": tseslint.plugin },
    rules: {
      "@typescript-eslint/no-explicit-any": "error",
      "@typescript-eslint/no-non-null-assertion": "error",
      "no-restricted-syntax": [
        "error",
        {
          selector:
            "TSAsExpression[typeAnnotation.type='TSStringKeyword'] > CallExpression[callee.object.name='formData'][callee.property.name='get']",
          message:
            "Parse form data with a zod schema instead of casting formData.get(...) as string.",
        },
      ],
    },
  }
);
