// @ts-check
const tseslint = require('@typescript-eslint/eslint-plugin')
const tsParser = require('@typescript-eslint/parser')
const angularEslint = require('@angular-eslint/eslint-plugin')
const angularTemplateEslint = require('@angular-eslint/eslint-plugin-template')
const angularTemplateParser = require('@angular-eslint/template-parser')
const importPlugin = require('eslint-plugin-import')
const prettierConfig = require('eslint-config-prettier')

/** @type {import('eslint').Linter.FlatConfig[]} */
module.exports = [
  {
    ignores: ['dist/', '.angular/', 'coverage/', 'node_modules/', '*.js'],
  },
  {
    files: ['**/*.ts'],
    languageOptions: {
      parser: tsParser,
      parserOptions: {
        project: ['tsconfig.json', 'tsconfig.app.json', 'tsconfig.spec.json'],
        tsconfigRootDir: __dirname,
      },
    },
    plugins: {
      '@typescript-eslint': tseslint,
      '@angular-eslint': angularEslint,
      import: importPlugin,
    },
    rules: {
      ...tseslint.configs['recommended'].rules,
      '@typescript-eslint/no-explicit-any': 'error',
      '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
      '@typescript-eslint/explicit-function-return-type': 'off',
      '@typescript-eslint/explicit-module-boundary-types': 'off',
      '@angular-eslint/no-input-rename': 'error',
      '@angular-eslint/use-lifecycle-interface': 'error',
      '@angular-eslint/component-class-suffix': ['error', { suffixes: ['Component', 'Page'] }],
      '@angular-eslint/directive-class-suffix': 'error',
      'import/order': [
        'warn',
        {
          groups: ['builtin', 'external', 'internal', 'parent', 'sibling', 'index'],
          pathGroups: [
            { pattern: '@angular/**', group: 'external', position: 'before' },
            { pattern: '@ngrx/**', group: 'external', position: 'after' },
            { pattern: '@ngneat/**', group: 'external', position: 'after' },
            { pattern: '@core/**', group: 'internal', position: 'before' },
            { pattern: '@data/**', group: 'internal' },
            { pattern: '@store/**', group: 'internal' },
            { pattern: '@features/**', group: 'internal' },
            { pattern: '@shared/**', group: 'internal', position: 'after' },
            { pattern: '@env/**', group: 'internal', position: 'after' },
          ],
          pathGroupsExcludedImportTypes: [],
          'newlines-between': 'always',
          alphabetize: { order: 'asc' },
        },
      ],
      'import/no-cycle': 'error',
      ...prettierConfig.rules,
    },
  },
  {
    files: ['**/*.html'],
    languageOptions: {
      parser: angularTemplateParser,
    },
    plugins: {
      '@angular-eslint': angularEslint,
      '@angular-eslint/template': angularTemplateEslint,
    },
    rules: {
      '@angular-eslint/template/no-negated-async': 'error',
      '@angular-eslint/template/alt-text': 'warn',
      '@angular-eslint/template/interactive-supports-focus': 'warn',
    },
  },
]
