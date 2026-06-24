export default {
  angular: {
    config: 'angular.json',
  },
  ignore: [
    'src/app/shared/models/gb3-api-generated.interfaces.ts', // Generated, so we don't want to clean that up every time
    'src/app/shared/models/swisstopo-api-generated.interface.ts', // Generated, so we don't want to clean that up every time
    'src/app/shared/models/geoshop-api-generated.interface.ts', // Generated, so we don't want to clean that up every time
    // State management should not be included, since all the exports could potentially be used and re-adding them is harder than ignoreing them
    'src/**/*.reducer.ts',
    'src/**/*.selector.ts',
    'src/app/testing/providers.ts',
    '*/**/*.spec.exclude.ts', // In case we need to exclude specific tests from being executed, we don't want Knip to complain.
  ],
  ignoreDependencies: [
    '@angular-eslint/schematics', // Needed, but only in @angular-eslint itself
    '@angular-eslint/template-parser', // Needed, but only in @angular-eslint itself
    '@ngrx/schematics', // Needed, but only in Angular itself
    'material-icons', // Listed as unused, evven though we use it in CSS.
    'har-format', // Installed via @types/har-format
  ],
  ignoreBinaries: ['swagger-typescript-api'],
  rules: {
    exports: 'off',
    types: 'off',
  },
};
