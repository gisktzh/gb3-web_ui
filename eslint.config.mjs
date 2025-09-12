/*jshint esversion: 6 */
import eslint from '@eslint/js';
import tseslint from 'typescript-eslint';
import prettierRecommended from 'eslint-plugin-prettier/recommended';
import ngrx from '@ngrx/eslint-plugin/v9';
import angular from 'angular-eslint';

/**
 * TODO: The following imports should be revisited once the following issues are resolved:
 *  * eslint-plugin-rxjs
 *    Either it will be updated to support ESLint 9 or included into 'rxjs'
 *    * https://github.com/ReactiveX/rxjs/discussions/7492
 *  * eslint-plugin-rxjs-angular
 *    Either it will be updated to support ESLint 9 or included into 'angular-eslint'
 *    * https://github.com/cartant/eslint-plugin-rxjs-angular/issues/23
 *    * https://github.com/angular-eslint/angular-eslint/discussions/2094
 */
import rxjsX from 'eslint-plugin-rxjs-x';
import rxjsAngularX from 'eslint-plugin-rxjs-angular-x';

export default tseslint.config(
  {
    // global ignore, see https://eslint.org/docs/latest/use/configure/ignore#ignoring-files
    ignores: ['.angular/**', 'coverage/**', 'dev/**', '.docker/**', 'dist/**'],
  },
  {
    ignores: ['**/*.mock.ts', '**/*.stub.ts'],
    files: ['src/**/*.ts'],
    extends: [
      eslint.configs.recommended,
      ...tseslint.configs.recommended,
      ...angular.configs.tsRecommended,
      prettierRecommended,
      ...ngrx.configs.all,
      rxjsX.configs.recommended,
    ],
    plugins: {
      rxjs: rxjsX,
      'rxjs-angular-x': rxjsAngularX,
    },
    processor: angular.processInlineTemplates,
    rules: {
      '@typescript-eslint/ban-ts-comment': [
        'warn',
        {
          'ts-ignore': 'allow-with-description',
        },
      ],

      '@typescript-eslint/no-unused-vars': [
        'warn',
        {
          argsIgnorePattern: '^_',
          varsIgnorePattern: '^_',
          caughtErrors: 'none',
        },
      ],

      '@angular-eslint/component-selector': [
        'error',
        {
          type: 'element',
          prefix: '',
          style: 'kebab-case',
        },
      ],

      '@angular-eslint/directive-selector': [
        'error',
        {
          type: 'attribute',
          prefix: [''],
          style: 'camelCase',
        },
      ],

      '@typescript-eslint/explicit-member-accessibility': [
        'error',
        {
          accessibility: 'explicit',
          ignoredMethodNames: ['ngOnInit', 'ngOnDestroy', 'ngAfterViewInit'],

          overrides: {
            constructors: 'no-public',
          },
        },
      ],

      '@typescript-eslint/no-inferrable-types': [
        'error',
        {
          ignoreParameters: true,
          ignoreProperties: true,
        },
      ],

      '@typescript-eslint/no-empty-function': 'warn',

      '@typescript-eslint/naming-convention': [
        'error',
        {
          selector: 'property',
          format: ['UPPER_CASE', 'camelCase'],
          leadingUnderscore: 'allow',
        },
        {
          selector: ['objectLiteralProperty'],
          format: null,
          modifiers: ['requiresQuotes'],
        },
        {
          selector: ['enum', 'enumMember'],
          format: ['PascalCase'],
        },
      ],

      'arrow-parens': ['off', 'always'],
      'rxjs/no-floating-observables': 'warn',
      'rxjs-angular-x/prefer-composition': 'error',
      'dot-notation': 'off',

      '@typescript-eslint/dot-notation': [
        'error',
        {
          allowIndexSignaturePropertyAccess: true,
        },
      ],

      'id-denylist': ['error', 'any', 'Number', 'number', 'String', 'string', 'Boolean', 'boolean', 'Undefined', 'undefined'],

      'no-underscore-dangle': 'off',
      'arrow-body-style': 'off',
      'import/order': 'off',
      'no-empty-function': 'off',
      'no-shadow': 'off',
      '@typescript-eslint/no-shadow': ['error'],
      'no-unused-expressions': 'error',
      'no-use-before-define': 'off',
      eqeqeq: [2, 'smart'],
      semi: 'error',
      'prefer-template': 'warn',
      '@typescript-eslint/switch-exhaustiveness-check': 'error',

      'no-console': [
        'error',
        {
          allow: ['warn', 'error'],
        },
      ],
    },
  },
  {
    files: ['src/**/*.html'],
    ignores: ['src/**/index.html'],
    extends: [...angular.configs.templateRecommended, ...angular.configs.templateAccessibility, prettierRecommended],
    rules: {
      '@angular-eslint/template/prefer-control-flow': ['error'],
      '@angular-eslint/template/eqeqeq': [
        'error',
        {
          allowNullOrUndefined: true,
        },
      ],
    },
  },
);
