import {createFeature, createReducer, on} from '@ngrx/store';
import {MapImportState} from '../states/map-import.state';
import {MapImportActions} from '../actions/map-import.actions';
import {produce} from 'immer';
import {ExternalLayerSelection} from '../../../shared/interfaces/external-layer-selection.interface';

export const mapImportFeatureKey = 'mapImport';

export const initialState: MapImportState = {
  loadingState: undefined,
  externalMapItem: undefined,
  layerSelections: undefined,
  title: undefined,
};

export const mapImportFeature = createFeature({
  name: mapImportFeatureKey,
  reducer: createReducer(
    initialState,
    on(MapImportActions.loadExternalMapItem, (): MapImportState => {
      return {...initialState, loadingState: 'loading'};
    }),
    on(MapImportActions.setExternalMapItem, (_, {externalMapItem}): MapImportState => {
      return {...initialState, loadingState: 'loaded', externalMapItem};
    }),
    on(MapImportActions.setExternalMapItemError, (): MapImportState => {
      return {...initialState, loadingState: 'error'};
    }),
    on(MapImportActions.setLayerSelections, (state, {layers}): MapImportState => {
      const layerSelections: ExternalLayerSelection[] = layers.map((layer) => ({layer, isSelected: false}));
      return {...state, layerSelections};
    }),
    on(
      MapImportActions.setAllSelectedLayers,
      produce((draft, {isSelected}) => {
        draft.layerSelections?.forEach((selection) => (selection.isSelected = isSelected));
      }),
    ),
    on(
      MapImportActions.toggleSelectedLayer,
      produce((draft, {layerId}) => {
        draft.layerSelections?.forEach((selection) => {
          if (selection.layer.id === layerId) {
            selection.isSelected = !selection.isSelected;
          }
        });
      }),
    ),
    on(MapImportActions.setTitle, (state, {title}): MapImportState => {
      return {...state, title};
    }),
    on(MapImportActions.clearExternalMapItemAndSelection, (): MapImportState => {
      return initialState;
    }),
  ),
});

export const {name, reducer, selectMapImportState, selectLoadingState, selectExternalMapItem, selectLayerSelections, selectTitle} =
  mapImportFeature;
