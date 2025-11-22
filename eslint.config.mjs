import js from '@eslint/js'
import globals from 'globals'
import nextConfig from 'eslint-config-next'

const eslintConfig = [
  { ignores: ['.next/**', 'node_modules/**'] },
  js.configs.recommended,
  ...nextConfig,
  {
    files: ['**/*.{js,jsx,ts,tsx}'],
    languageOptions: {
      globals: {
        ...globals.browser,
        React: 'readonly',
      },
    },
    rules: {
      'react-hooks/preserve-manual-memoization': 'off',
      'react-hooks/set-state-in-effect': 'off',
      'react-hooks/purity': 'off',
      'react/no-unescaped-entities': 'off',
    },
  },
  {
    files: ['**/*.ts', '**/*.tsx'],
    rules: {
      // Add any additional TypeScript-specific rules here
      'no-unused-vars': 'off', // Turn off base rule
      '@typescript-eslint/no-unused-vars': ['error', {
        argsIgnorePattern: '^_',
        varsIgnorePattern: '^_',
        ignoreRestSiblings: true,
        caughtErrors: 'none'
      }],
      '@typescript-eslint/no-explicit-any': 'off',
    },
    languageOptions: {
      globals: {
        RequestInit: 'readonly',
        Headers: 'readonly',
        Response: 'readonly',
        fetch: 'readonly',
        console: 'readonly',
        process: 'readonly',
        Buffer: 'readonly',
        setTimeout: 'readonly',
        clearTimeout: 'readonly',
        setInterval: 'readonly',
        clearInterval: 'readonly',
      },
    },
  },
  {
    files: ['**/*.test.ts', '**/*.test.tsx', '**/*.spec.ts', '**/*.spec.tsx', 'tests/**/*.ts', 'tests/**/*.tsx'],
    rules: {
      'no-undef': 'off', // Jest globals are provided
    },
    languageOptions: {
      globals: {
        describe: 'readonly',
        it: 'readonly',
        test: 'readonly',
        expect: 'readonly',
        jest: 'readonly',
        beforeEach: 'readonly',
        afterEach: 'readonly',
        beforeAll: 'readonly',
        afterAll: 'readonly',
      },
    },
  },
]

export default eslintConfig