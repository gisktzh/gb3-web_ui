import {createFeature, createReducer, on} from '@ngrx/store';
import {DataCatalogueState} from '../states/data-catalogue.state';
import {DataCatalogueActions} from '../actions/data-catalogue.actions';
import {produce} from 'immer';

export const dataCatalogueFeatureKey = 'dataCatalogue';

export const initialState: DataCatalogueState = {
  items: [],
  filters: [],
  loadingState: 'undefined',
};

export const dataCatalogueFeature = createFeature({
  name: dataCatalogueFeatureKey,
  reducer: createReducer(
    initialState,
    on(DataCatalogueActions.loadCatalogue, (state): DataCatalogueState => {
      if (state.loadingState === 'loaded') {
        return state;
      }
      return {...initialState, loadingState: 'loading'};
    }),
    on(DataCatalogueActions.setCatalogue, (state, {items}): DataCatalogueState => {
      return {...state, items, loadingState: 'loaded'};
    }),
    on(DataCatalogueActions.setError, (): DataCatalogueState => {
      return {...initialState, loadingState: 'error'};
    }),
    on(DataCatalogueActions.setFilters, (state, {dataCatalogueFilters}): DataCatalogueState => {
      return {...state, filters: dataCatalogueFilters};
    }),
    on(
      DataCatalogueActions.resetFilters,
      produce((draft) => {
        draft.filters.forEach((filter) => filter.filterValues.forEach((f) => (f.isActive = false)));
      }),
    ),
    on(
      DataCatalogueActions.toggleFilter,
      produce((draft, {key, value}) => {
        draft.filters
          .find((filter) => filter.key === key)!
          .filterValues.filter((filterValue) => filterValue.value === value)
          .forEach((filterValue) => {
            filterValue.isActive = !filterValue.isActive;
          });
      }),
    ),
  ),
});

export const {name, reducer, selectDataCatalogueState, selectFilters, selectItems, selectLoadingState} = dataCatalogueFeature;
