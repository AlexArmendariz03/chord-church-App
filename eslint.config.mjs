import { defineConfig, globalIgnores } from "eslint/config"
import nextVitals from "eslint-config-next/core-web-vitals"

export default defineConfig([
  ...nextVitals,
  // Archivos generados: no los escribimos nosotros
  globalIgnores([".next/**", "node_modules/**", "next-env.d.ts", "generated/**"]),
  {
    rules: {
      // Aviso para dividir componentes grandes; no bloquea
      "max-lines": ["warn", { max: 300, skipBlankLines: true }],
      "max-len": ["warn", { code: 180 }],
      "no-trailing-spaces": "error",
      "no-console": ["error", { allow: ["warn", "error", "info"] }],
      "arrow-spacing": ["error", { before: true, after: true }],
      "arrow-parens": ["warn", "as-needed"],
      "space-in-parens": ["error", "never"],
      "no-lonely-if": "error",
      "dot-location": ["error", "property"],
      "no-var": "warn",
      "jsx-quotes": ["error", "prefer-double"],
      "comma-style": ["error", "last"],
      "comma-dangle": ["error", "never"],
      "default-case": "error",
      "no-redeclare": "error",
      "no-useless-return": "error",
      "no-unused-vars": ["error", { ignoreRestSiblings: true }],
      "prefer-arrow-callback": "error",
      "prefer-const": "error",
      "prefer-template": "error",
      "dot-notation": "error",
      "max-depth": ["error", 3],
      "object-curly-spacing": ["error", "always"],
      quotes: ["warn", "double"],
      semi: ["error", "never"],
      "space-infix-ops": "error",
      "react/no-deprecated": "warn",
      "react/react-in-jsx-scope": "off",
      "react/jsx-closing-bracket-location": ["error", { selfClosing: "after-props", nonEmpty: "after-props" }],
      "react/jsx-first-prop-new-line": ["error", "multiline-multiprop"],
      "react/jsx-indent": ["error", 2],
      "react/jsx-indent-props": ["error", 2],
      "react/jsx-no-bind": ["error", { allowArrowFunctions: true }],
      "react/jsx-no-duplicate-props": "error",
      "react/jsx-tag-spacing": ["error", { closingSlash: "never", beforeSelfClosing: "always", afterOpening: "never", beforeClosing: "never" }],
      "react/jsx-max-props-per-line": ["error", { maximum: 2, when: "always" }],
      "react/jsx-uses-react": "error",
      "react/jsx-uses-vars": "error",
      "react/prop-types": "off",
      // Reglas nuevas de React (pensadas para React Compiler). El código actual funciona; se corrige
      // al dividir los componentes grandes, mientras tanto solo avisan
      "react-hooks/set-state-in-effect": "warn",
      "react-hooks/refs": "warn",
      "react-hooks/purity": "warn"
    }
  },
  {
    // En TypeScript, la regla base marca los nombres de parámetros de los tipos de función
    // (`onChange: (value: string) => void`); la de typescript-eslint los entiende
    files: ["**/*.ts", "**/*.tsx"],
    rules: {
      "no-unused-vars": "off",
      "@typescript-eslint/no-unused-vars": ["error", { ignoreRestSiblings: true, varsIgnorePattern: "^_" }]
    }
  },
  {
    // Scripts de terminal: imprimir en consola es su salida
    files: ["prisma/**/*.mjs"],
    rules: { "no-console": "off" }
  }
])
