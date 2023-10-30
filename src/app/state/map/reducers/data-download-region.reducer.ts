import {createFeature, createReducer, on} from '@ngrx/store';
import {DataDownloadRegionState} from '../states/data-download-region.state';
import {DataDownloadRegionActions} from '../actions/data-download-region.actions';

export const dataDownloadRegionFeatureKey = 'dataDownloadRegion';

export const initialState: DataDownloadRegionState = {
  canton: undefined,
  cantonLoadingState: undefined,
  municipalities: [],
  municipalitiesLoadingState: undefined,
  currentMunicipality: undefined,
  currentMunicipalityLoadingState: undefined,
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
      if (state.municipalities) {
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
    on(DataDownloadRegionActions.loadCurrentMunicipality, (state): DataDownloadRegionState => {
      return {...state, currentMunicipality: initialState.currentMunicipality, currentMunicipalityLoadingState: 'loading'};
    }),
    on(DataDownloadRegionActions.setCurrentMunicipality, (state, {municipality}): DataDownloadRegionState => {
      return {...state, currentMunicipality: municipality, currentMunicipalityLoadingState: 'loaded'};
    }),
    on(DataDownloadRegionActions.setCurrentMunicipalityError, (state): DataDownloadRegionState => {
      return {...state, currentMunicipality: initialState.currentMunicipality, currentMunicipalityLoadingState: 'error'};
    }),
    on(DataDownloadRegionActions.clearCurrentMunicipality, (state): DataDownloadRegionState => {
      return {
        ...state,
        currentMunicipality: initialState.currentMunicipality,
        currentMunicipalityLoadingState: initialState.currentMunicipalityLoadingState,
      };
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
  selectCurrentMunicipality,
  selectCurrentMunicipalityLoadingState,
} = dataDownloadRegionFeature;
