import {createFeature, createReducer, on} from '@ngrx/store';
import {DataCatalogueState} from '../states/data-catalogue.state';
import {DataCatalogueActions} from '../actions/data-catalogue.actions';

export const dataCatalogueFeatureKey = 'dataCatalogue';

export const initialState: DataCatalogueState = {
  items: [],
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
  ),
});

export const {name, reducer, selectDataCatalogueState, selectItems, selectLoadingState} = dataCatalogueFeature;
