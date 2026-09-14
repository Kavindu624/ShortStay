import js from '@eslint/js'
import globals from 'globals'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'
import { defineConfig, globalIgnores } from 'eslint/config'

export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{js,jsx}'],
    extends: [
      js.configs.recommended,
      reactHooks.configs.flat.recommended,
      reactRefresh.configs.vite,
    ],
    languageOptions: {
      globals: globals.browser,
      parserOptions: { ecmaFeatures: { jsx: true } },
    },
    rules: {
      // This rule (new in eslint-plugin-react-hooks v6+, aimed at React
      // Compiler readiness) flags the very common "fetch on mount" pattern
      // used throughout this codebase (an effect that synchronously calls a
      // loading-flag setter before an async request resolves). That pattern
      // is not a bug here — it's reviewed and correct — so this is kept as a
      // warning rather than disabled outright, in case a *genuine* issue of
      // this shape gets introduced later.
      'react-hooks/set-state-in-effect': 'warn',
    },
  },
])
