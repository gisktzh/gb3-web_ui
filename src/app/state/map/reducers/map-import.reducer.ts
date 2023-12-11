import {createFeature, createReducer, on} from '@ngrx/store';
import {MapImportState} from '../states/map-import.state';
import {MapImportActions} from '../actions/map-import.actions';
import {produce} from 'immer';

export const mapImportFeatureKey = 'mapImport';

export const initialState: MapImportState = {
  temporaryExternalMapItem: undefined,
  loadingState: undefined,
  externalMapItem: undefined,
};

export const mapImportFeature = createFeature({
  name: mapImportFeatureKey,
  reducer: createReducer(
    initialState,
    on(MapImportActions.loadTemporaryExternalMap, (): MapImportState => {
      return {...initialState, loadingState: 'loading'};
    }),
    on(MapImportActions.setTemporaryExternalMap, (_, {temporaryExternalMapItem}): MapImportState => {
      return {...initialState, loadingState: 'loaded', temporaryExternalMapItem};
    }),
    on(MapImportActions.setTemporaryExternalMapError, (): MapImportState => {
      return {...initialState, loadingState: 'error'};
    }),
    on(MapImportActions.setExternalMapItem, (state, {externalMapItem}): MapImportState => {
      return {...state, externalMapItem};
    }),
    on(
      MapImportActions.setExternalMapItemTitle,
      produce((draft, {title}) => {
        if (draft.externalMapItem) {
          draft.externalMapItem.title = title;
        }
      }),
    ),
  ),
});

export const {name, reducer, selectMapImportState, selectTemporaryExternalMapItem, selectLoadingState, selectExternalMapItem} =
  mapImportFeature;
