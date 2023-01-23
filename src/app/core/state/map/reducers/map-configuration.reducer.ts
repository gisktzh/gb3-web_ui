import {createFeature, createReducer, on} from '@ngrx/store';
import {MapConfigurationActions} from '../actions/map-configuration.actions';
import {defaultMapConfig} from '../../../../shared/configs/map-config';
import {BackgroundMap} from '../../../../shared/interfaces/background-map.interface';

export const mapConfigurationFeatureKey = 'mapConfiguration';

export interface MapConfigurationState {
  center: {x: number; y: number};
  scale: number;
  srsId: number;
  ready: boolean;
  scaleSettings: {minScale: number; maxScale: number; calculatedMinScale: number; calculatedMaxScale: number};
  isMaxZoomedIn: boolean;
  isMaxZoomedOut: boolean;
  backgroundMap: BackgroundMap;
}

export const initialState: MapConfigurationState = {
  center: defaultMapConfig.center,
  scale: defaultMapConfig.scale,
  srsId: defaultMapConfig.srsId,
  ready: defaultMapConfig.ready,
  scaleSettings: defaultMapConfig.scaleSettings,
  backgroundMap: defaultMapConfig.backgroundMap,
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
      /**
       * maxZoomedOut: scale is smaller or equal to the calculated max, floored.
       * maxZoomedIn: scale is larger than or equal to the calculated min, ceiled.
       *
       * Flooring/ceiling accounts for rounding and precision differences in the actual scale vs the calculated ones.
       */
      const isMaxZoomedIn = Math.floor(scale) <= state.scaleSettings.calculatedMaxScale;
      const isMaxZoomedOut = Math.ceil(scale) >= state.scaleSettings.calculatedMinScale;
      return {...state, center: {x, y}, scale, isMaxZoomedIn, isMaxZoomedOut};
    }),
    on(MapConfigurationActions.setReady, (state, {calculatedMinScale, calculatedMaxScale}): MapConfigurationState => {
      /**
       * Because the calculatedMinScale/calculatedMaxScale can be float values, we round them: minScale is ceiled (as
       * e.g. 100.45 should be 101), maxScale is floored (as 1000.45 should be 1000).
       *
       * The reason for this is that we need to compare the actual scale with the max values to discern whether we are
       * maximally zoomedIn/zoomedOut, but that scale might not reflect the same precision as the calculatedMax/Min
       * values.
       */
      const scaleSettings = structuredClone(state.scaleSettings);
      scaleSettings.calculatedMinScale = Math.floor(calculatedMinScale);
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
