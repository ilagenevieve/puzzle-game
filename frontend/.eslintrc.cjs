module.exports = {
  root: true,
  env: {
    browser: true,
    es2021: true,
    node: true
  },
  extends: [
    'eslint:recommended',
    'plugin:svelte/recommended'
  ],
  parserOptions: {
    ecmaVersion: 'latest',
    sourceType: 'module'
  },
  plugins: [
    'svelte'
  ],
  overrides: [
    {
      files: ['*.svelte'],
      parser: 'svelte-eslint-parser'
    },
    {
      files: ['*.test.js', '*.spec.js'],
      env: {
        jest: true
      },
      rules: {
        'no-undef': 'off'
      }
    }
  ],
  rules: {
    'no-unused-vars': ['warn', { 
      argsIgnorePattern: '^_',
      varsIgnorePattern: '^_' 
    }],
    'svelte/no-unused-svelte-ignore': 'warn',
    'svelte/html-quotes': ['error', { 
      prefer: 'double' 
    }],
    'svelte/html-self-closing': ['error', {
      void: 'always',
      normal: 'never',
      component: 'always'
    }]
  }
}