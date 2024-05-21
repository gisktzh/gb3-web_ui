import {createFeature, createReducer, on} from '@ngrx/store';
import {ExportActions} from '../actions/export.actions';
import {ExportState} from '../states/export.state';

export const exportFeatureKey = 'export';
export const initialState: ExportState = {
  exportFormat: undefined,
  exportLoadingState: undefined,
};

export const exportFeature = createFeature({
  name: exportFeatureKey,
  reducer: createReducer(
    initialState,
    on(ExportActions.requestDrawingsExport, ({exportFormat}): ExportState => {
      return {...initialState, exportLoadingState: 'loading', exportFormat};
    }),
    on(ExportActions.setDrawingsExportRequestResponse, (state): ExportState => {
      return {...state, exportLoadingState: 'loaded'};
    }),
    on(ExportActions.setDrawingsExportRequestError, (state): ExportState => {
      return {...state, exportLoadingState: 'error', exportFormat: initialState.exportFormat};
    }),
  ),
});

export const {name, reducer} = exportFeature;
