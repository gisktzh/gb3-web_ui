import {createFeature, createReducer, on} from '@ngrx/store';
import {ImportActions} from '../actions/import.actions';
import {ImportState} from '../states/import.state';

export const importFeatureKey = 'drawingImport';
export const initialState: ImportState = {
  loadingState: undefined,
};

export const importFeature = createFeature({
  name: importFeatureKey,
  reducer: createReducer(
    initialState,
    on(ImportActions.requestDrawingsImport, (state): ImportState => {
      return {...state, loadingState: 'loading'};
    }),
    on(ImportActions.addDrawingToMap, (state): ImportState => {
      return {...state, loadingState: 'loaded'};
    }),
    on(ImportActions.setDrawingsImportRequestError, (state): ImportState => {
      return {...state, loadingState: 'error'};
    }),
    on(ImportActions.resetDrawingImportState, (): ImportState => {
      return {...initialState};
    }),
  ),
});

export const {name, reducer, selectLoadingState} = importFeature;
