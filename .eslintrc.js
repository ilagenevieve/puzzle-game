module.exports = {
  root: true,
  env: {
    node: true,
    browser: true,
    es2021: true,
  },
  extends: [
    'eslint:recommended',
    'airbnb-base',
  ],
  parserOptions: {
    ecmaVersion: 'latest',
    sourceType: 'module',
  },
  rules: {
    'no-console': process.env.NODE_ENV === 'production' ? 'warn' : 'off',
    'no-debugger': process.env.NODE_ENV === 'production' ? 'warn' : 'off',
    semi: ['error', 'never'],
    quotes: ['error', 'single'],
    'max-len': ['error', { code: 100, ignoreUrls: true }],
    'no-param-reassign': ['error', { props: false }],
    'import/extensions': ['error', 'ignorePackages', {
      js: 'never',
      mjs: 'never',
      jsx: 'never',
      svelte: 'never',
    }],
  },
  overrides: [
    {
      files: ['**/*.svelte'],
      plugins: ['svelte'],
      parser: 'svelte-eslint-parser',
      extends: ['plugin:svelte/recommended'],
      rules: {
        'import/no-mutable-exports': 'off',
        'import/first': 'off',
        'no-multiple-empty-lines': ['error', { max: 1, maxBOF: 2, maxEOF: 0 }],
      },
    },
    {
      files: [
        '**/__tests__/*.{j,t}s?(x)',
        '**/tests/unit/**/*.spec.{j,t}s?(x)',
        '**/tests/**/*.{test,spec}.{j,t}s?(x)',
      ],
      env: {
        jest: true,
        'vitest-globals/env': true,
      },
      extends: ['plugin:vitest-globals/recommended'],
    },
  ],
  settings: {
    'import/resolver': {
      node: {
        extensions: ['.js', '.svelte'],
      },
    },
  },
}