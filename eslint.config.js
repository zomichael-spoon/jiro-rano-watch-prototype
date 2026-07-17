import tsPlugin from '@typescript-eslint/eslint-plugin';
import tsParser from '@typescript-eslint/parser';

export default [
  {
    files: ['**/*.ts', '**/*.tsx'],
    plugins: {
      '@typescript-eslint': tsPlugin,
    },
    languageOptions: {
      parser: tsParser,
    },
    rules: {
      // Turn off the base rule to prevent duplicate warnings
      'no-unused-vars': 'off', 
      // Enable the TypeScript rule
      '@typescript-eslint/no-unused-vars': 'error',
      "no-extra-semi": "error"
    },
  },
];
