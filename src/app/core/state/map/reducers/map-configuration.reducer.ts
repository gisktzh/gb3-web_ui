import {createFeature, createReducer, on} from '@ngrx/store';
import {MapConfigurationActions} from '../actions/map-configuration.actions';
import {defaultMapConfig} from '../../../../shared/configs/map-config';

export const mapConfigurationFeatureKey = 'mapConfiguration';

export interface MapConfigurationState {
  center: {x: number; y: number};
  scale: number;
  srsId: number;
  ready: boolean;
  scaleSettings: {minScale: number; maxScale: number; calculatedMinScale: number; calculatedMaxScale: number};
  isMaxZoomedIn: boolean;
  isMaxZoomedOut: boolean;
}

export const initialState: MapConfigurationState = {
  center: defaultMapConfig.center,
  scale: defaultMapConfig.scale,
  srsId: defaultMapConfig.srsId,
  ready: defaultMapConfig.ready,
  scaleSettings: defaultMapConfig.scaleSettings,
  isMaxZoomedIn: defaultMapConfig.isMaxZoomedIn,
  isMaxZoomedOut: defaultMapConfig.isMaxZoomedOut
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
      const isMaxZoomedIn = Math.floor(scale) <= state.scaleSettings.calculatedMaxScale;
      const isMaxZoomedOut = Math.ceil(scale) >= state.scaleSettings.calculatedMinScale;
      return {...state, center: {x, y}, scale, isMaxZoomedIn, isMaxZoomedOut};
    }),
    on(MapConfigurationActions.setReady, (state, {calculatedMinScale, calculatedMaxScale}): MapConfigurationState => {
      const scaleSettings = structuredClone(state.scaleSettings);
      scaleSettings.calculatedMinScale = Math.round(calculatedMinScale);
      scaleSettings.calculatedMaxScale = Math.ceil(calculatedMaxScale);

      return {...state, scaleSettings, ready: true};
    }),
    on(MapConfigurationActions.setScale, (state, {scale}): MapConfigurationState => {
      return {...state, scale};
    }),
    on(MapConfigurationActions.resetExtent, (state): MapConfigurationState => {
      return {...state};
    }),
    on(MapConfigurationActions.changeZoom, (state, {zoomType}): MapConfigurationState => {
      return {...state};
    })
  )
});

export const {
  name,
  reducer,
  selectMapConfigurationState,
  selectCenter,
  selectScale,
  selectSrsId,
  selectReady,
  selectIsMaxZoomedIn,
  selectIsMaxZoomedOut
} = mapConfigurationFeature;
