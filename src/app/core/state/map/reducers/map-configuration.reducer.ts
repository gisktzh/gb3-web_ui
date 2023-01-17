import {createFeature, createReducer, on} from '@ngrx/store';
import {MapConfigurationActions} from '../actions/map-configuration.actions';
import {defaultMapConfig} from '../../../../shared/configs/map-config';

export const mapConfigurationFeatureKey = 'mapConfiguration';

export interface MapConfigurationState {
  center: {x: number; y: number};
  scale: number;
  srsId: number;
  ready: boolean;
  scaleSettings: {minScale: number; maxScale: number};
}

export const initialState: MapConfigurationState = {
  center: defaultMapConfig.center,
  scale: defaultMapConfig.scale,
  srsId: defaultMapConfig.srsId,
  ready: defaultMapConfig.ready,
  scaleSettings: defaultMapConfig.scaleSettings
};

export const mapConfigurationFeature = createFeature({
  name: mapConfigurationFeatureKey,
  reducer: createReducer(
    initialState,
    on(MapConfigurationActions.setInitialExtent, (state, {x, y, scale}): MapConfigurationState => {
      const initialExtent = {
        center: {
          x: x ?? initialState.center.x,
          y: y ?? initialState.center.y
        },
        scale: scale ?? initialState.scale
      };
      return {...state, ...initialExtent};
    }),
    on(MapConfigurationActions.setMapExtent, (state, {x, y, scale}): MapConfigurationState => {
      return {...state, center: {x, y}, scale};
    }),
    on(MapConfigurationActions.setReady, (state): MapConfigurationState => {
      return {...state, ready: true};
    }),
    on(MapConfigurationActions.setScale, (state, {scale}): MapConfigurationState => {
      return {...state, scale};
    }),
    on(MapConfigurationActions.resetExtent, (state): MapConfigurationState => {
      return {...state};
    })
  )
});

export const {name, reducer, selectMapConfigurationState, selectCenter, selectScale, selectSrsId, selectReady} = mapConfigurationFeature;
