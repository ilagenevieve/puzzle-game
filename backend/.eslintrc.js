module.exports = {
  root: true,
  env: {
    node: true,
    commonjs: true,
    es2021: true,
    jest: true
  },
  extends: [
    'eslint:recommended',
    'airbnb-base'
  ],
  parserOptions: {
    ecmaVersion: 2021
  },
  rules: {
    'no-console': process.env.NODE_ENV === 'production' ? 'warn' : 'off',
    'no-debugger': process.env.NODE_ENV === 'production' ? 'warn' : 'off',
    semi: ['error', 'never'],
    'comma-dangle': ['error', 'never'],
    'arrow-parens': ['error', 'as-needed'],
    'import/no-extraneous-dependencies': ['error', {
      devDependencies: ['**/*.test.js', '**/*.spec.js', '**/tests/**/*.js']
    }],
    'max-len': ['warn', { code: 120, ignoreUrls: true }],
    'no-param-reassign': ['error', { props: false }],
    'consistent-return': 'off',
    camelcase: 'off',
    'no-shadow': 'off',
    'no-useless-catch': 'off',
    'max-classes-per-file': 'off',
    'no-unused-vars': ['error', { argsIgnorePattern: '^_' }]
  }
}
