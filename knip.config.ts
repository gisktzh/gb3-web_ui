export default {
  angular: {
    config: 'angular.json',
  },
  ignore: [
    'src/app/shared/models/gb3-api-generated.interfaces.ts', // Generated, so we don't want to clean that up every time
    'src/app/shared/models/swisstopo-api-generated.interface.ts', // Generated, so we don't want to clean that up every time
    'src/app/shared/models/grav-cms-generated.interfaces.ts', // Generated, so we don't want to clean that up every time
    'src/app/shared/models/geoshop-api-generated.interface.ts', // Generated, so we don't want to clean that up every time
    // State management should not be included, since all the exports could potentially be used and re-adding them is harder than ignoreing them
    'src/**/*.reducer.ts',
    'src/**/*.selector.ts',
    'src/app/testing/providers.ts',
  ],
  ignoreDependencies: ['@angular-eslint/schematics', '@angular-eslint/template-parser', '@ngrx/schematics', 'material-icons'],
  ignoreBinaries: ['swagger-typescript-api'],
};
