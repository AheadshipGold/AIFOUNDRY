module.exports = {
  root: true,
  parser: '@typescript-eslint/parser',
  plugins: ['@typescript-eslint', 'react-hooks'],
  extends: ['eslint:recommended', 'plugin:@typescript-eslint/recommended', 'plugin:react-hooks/recommended'],
  env: { browser: true, node: true, es2022: true },
  parserOptions: { ecmaVersion: 'latest', sourceType: 'module', ecmaFeatures: { jsx: true } },
  ignorePatterns: ['node_modules', '.next', 'dist', '.expo'],
  rules: { '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_' }], '@typescript-eslint/no-empty-function': 'off' },
};
