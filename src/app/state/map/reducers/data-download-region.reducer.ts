import {createFeature, createReducer, on} from '@ngrx/store';
import {DataDownloadRegionState} from '../states/data-download-region.state';
import {DataDownloadRegionActions} from '../actions/data-download-region.actions';

export const dataDownloadRegionFeatureKey = 'dataDownloadRegion';

export const initialState: DataDownloadRegionState = {
  canton: undefined,
  cantonLoadingState: undefined,
  municipalities: [],
  municipalitiesLoadingState: undefined,
};

export const dataDownloadRegionFeature = createFeature({
  name: dataDownloadRegionFeatureKey,
  reducer: createReducer(
    initialState,
    on(DataDownloadRegionActions.loadCanton, (state): DataDownloadRegionState => {
      if (state.canton) {
        return state;
      }
      return {...state, canton: initialState.canton, cantonLoadingState: 'loading'};
    }),
    on(DataDownloadRegionActions.setCanton, (state, {canton}): DataDownloadRegionState => {
      return {...state, canton, cantonLoadingState: 'loaded'};
    }),
    on(DataDownloadRegionActions.setCantonError, (state): DataDownloadRegionState => {
      return {...state, canton: initialState.canton, cantonLoadingState: 'error'};
    }),
    on(DataDownloadRegionActions.loadMunicipalities, (state): DataDownloadRegionState => {
      if (state.municipalities.length > 0) {
        return state;
      }
      return {...state, municipalities: initialState.municipalities, municipalitiesLoadingState: 'loading'};
    }),
    on(DataDownloadRegionActions.setMunicipalities, (state, {municipalities}): DataDownloadRegionState => {
      return {...state, municipalities, municipalitiesLoadingState: 'loaded'};
    }),
    on(DataDownloadRegionActions.setMunicipalitiesError, (state): DataDownloadRegionState => {
      return {...state, municipalities: initialState.municipalities, municipalitiesLoadingState: 'error'};
    }),
  ),
});

export const {
  name,
  reducer,
  selectDataDownloadRegionState,
  selectCanton,
  selectCantonLoadingState,
  selectMunicipalities,
  selectMunicipalitiesLoadingState,
} = dataDownloadRegionFeature;
