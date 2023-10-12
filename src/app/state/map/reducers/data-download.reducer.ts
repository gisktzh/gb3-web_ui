import {createFeature, createReducer, on} from '@ngrx/store';
import {DataDownloadState} from '../states/data-download.state';
import {DataDownloadActions} from '../actions/data-download.actions';

export const dataDownloadFeatureKey = 'dataDownload';

export const initialState: DataDownloadState = {
  selection: undefined,
  loadingState: undefined,
  savingState: undefined,
};

export const dataDownloadFeature = createFeature({
  name: dataDownloadFeatureKey,
  reducer: createReducer(
    initialState,
    on(DataDownloadActions.setSelection, (state, {selection}): DataDownloadState => {
      return {...state, selection};
    }),
    on(DataDownloadActions.clearSelection, (): DataDownloadState => {
      return {...initialState};
    }),
  ),
});

export const {name, reducer, selectDataDownloadState} = dataDownloadFeature;
