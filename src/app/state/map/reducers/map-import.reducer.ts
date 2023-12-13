import {createFeature, createReducer, on} from '@ngrx/store';
import {MapImportState} from '../states/map-import.state';
import {MapImportActions} from '../actions/map-import.actions';
import {produce} from 'immer';
import {ExternalLayerSelection} from '../../../shared/interfaces/external-layer-selection.interface';

export const mapImportFeatureKey = 'mapImport';

export const initialState: MapImportState = {
  serviceType: undefined,
  url: undefined,
  layerSelections: undefined,
  title: undefined,
};

export const mapImportFeature = createFeature({
  name: mapImportFeatureKey,
  reducer: createReducer(
    initialState,
    on(MapImportActions.setServiceType, (_, {serviceType}): MapImportState => {
      return {...initialState, serviceType};
    }),
    on(MapImportActions.setUrl, (state, {url}): MapImportState => {
      return {...initialState, serviceType: state.serviceType, url};
    }),
    on(MapImportActions.setLayerSelections, (state, {layers}): MapImportState => {
      const layerSelections: ExternalLayerSelection[] = layers.map((layer) => ({layer, isSelected: false}));
      return {...state, layerSelections};
    }),
    on(
      MapImportActions.selectAllLayers,
      produce((draft, {isSelected}) => {
        draft.layerSelections?.forEach((selection) => (selection.isSelected = isSelected));
      }),
    ),
    on(
      MapImportActions.toggleLayerSelection,
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
    on(MapImportActions.clearAll, (): MapImportState => {
      return initialState;
    }),
  ),
});

export const {name, reducer, selectMapImportState, selectServiceType, selectUrl, selectLayerSelections, selectTitle} = mapImportFeature;
