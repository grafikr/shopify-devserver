module.exports = {
  env: {
    es2022: true,
    node: true,
  },
  extends: [
    'airbnb-base', 'airbnb-typescript/base',
  ],
  parserOptions: {
    project: './tsconfig.json',
    ecmaVersion: 'latest',
    sourceType: 'module',
  },
  rules: {
    'import/extensions': [
      'error',
      'ignorePackages',
      {
        ts: 'never',
      },
    ],
    'no-unreachable': 'error',
    'import/no-import-module-exports': ['error', {
      exceptions: ['.lib/main.ts'],
    }],
  },
};
