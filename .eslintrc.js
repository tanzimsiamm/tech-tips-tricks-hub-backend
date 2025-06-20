module.exports = {
  env: {
    node: true,
    es2021: true,
  },
  extends: [
    'airbnb-base',
    'plugin:node/recommended',
    'plugin:prettier/recommended',
  ],
  parserOptions: {
    ecmaVersion: 12,
  },
  rules: {
    'no-console': 'warn', // Allow console logs with a warning
    'node/no-unsupported-features/es-syntax': 'off', // Allow modern syntax in Node.js
    'prettier/prettier': 'error', // Enforce Prettier as an ESLint rule
  },
};