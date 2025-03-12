import {createFeature, createReducer, on} from '@ngrx/store';
import {MapConfigActions} from '../actions/map-config.actions';
import {defaultMapConfig} from '../../../shared/configs/map.config';
import {MapConfigState} from '../states/map-config.state';
import {produce} from 'immer';
import {MapConstants} from '../../../shared/constants/map.constants';

export const mapConfigFeatureKey = 'mapConfig';

export const initialState: MapConfigState = {
  isMapServiceInitialized: false,
  center: defaultMapConfig.center,
  rotation: defaultMapConfig.rotation,
  scale: defaultMapConfig.scale,
  srsId: defaultMapConfig.srsId,
  ready: defaultMapConfig.ready,
  scaleSettings: defaultMapConfig.scaleSettings,
  activeBasemapId: defaultMapConfig.activeBasemapId,
  isMaxZoomedIn: defaultMapConfig.isMaxZoomedIn,
  isMaxZoomedOut: defaultMapConfig.isMaxZoomedOut,
  initialMaps: defaultMapConfig.initialMaps,
  predefinedInitialExtent: defaultMapConfig.predefinedInitialExtent,
  initialMapPadding: defaultMapConfig.initialMapPadding,
  initialMapPaddingMobile: defaultMapConfig.initialMapPaddingMobile,
  initialBoundingBox: defaultMapConfig.initialBoundingBox,
  referenceDistanceInMeters: defaultMapConfig.referenceDistanceInMeters,
};

export const mapConfigFeature = createFeature({
  name: mapConfigFeatureKey,
  reducer: createReducer(
    initialState,
    on(MapConfigActions.markMapServiceAsInitialized, (state): MapConfigState => {
      return {...state, isMapServiceInitialized: true};
    }),
    on(MapConfigActions.setInitialMapConfig, (state, {x, y, scale, basemapId, initialMaps}): MapConfigState => {
      const initialExtent = {
        center: {
          x: x ?? initialState.center.x,
          y: y ?? initialState.center.y,
        },
        scale: scale ?? initialState.scale,
      };
      const activeBasemapId = basemapId ?? initialState.activeBasemapId;

      return {...state, activeBasemapId, initialMaps, ...initialExtent, predefinedInitialExtent: true};
    }),
    on(MapConfigActions.setMapExtent, (state, {x, y, scale}): MapConfigState => {
      /**
       * Now this is a somewhat tricky case and is a result of Esri's rather complex handling of scale levels and LODs. Simply put:
       *
       * maxZoomedOut: scale is smaller or equal to the defined MAXIMUM_MAP_SCALE, rounded.
       * maxZoomedIn: scale is larger than or equal to the calculated min, ceiled.
       *
       * Rounding/ceiling accounts for rounding and precision differences in the actual scale vs the calculated ones.
       *
       * Note that for the max scale, we compare to our fixed scale setting in our configuration because we _allow_ for those zoom
       * levels. This is a sideeffect of setting LODs to 32 (or higher) in our MapView constraints, because it essentially adds "fake"
       * LODs which allow for a zoom up to 1:1. For the min scale, however, we compare it to the calculated minScale, because Esri will
       * _not_ allow zooming out further than its calculated scale, essentially rendering our fixed minScale setting an approximation. This
       * is still true, even if setting 32 LODs.
       */
      const isMaxZoomedIn = Math.round(scale) <= MapConstants.MAXIMUM_MAP_SCALE;
      const isMaxZoomedOut = Math.ceil(scale) >= state.scaleSettings.calculatedMinScale;
      return {...state, center: {x, y}, scale, isMaxZoomedIn, isMaxZoomedOut};
    }),
    on(
      MapConfigActions.setReady,
      produce((draft, {calculatedMinScale, calculatedMaxScale}) => {
        /**
         * Because the calculatedMinScale/calculatedMaxScale can be float values, we round them: minScale is ceiled (as
         * e.g. 100.45 should be 101), maxScale is floored (as 1000.45 should be 1000).
         *
         * The reason for this is that we need to compare the actual scale with the max values to discern whether we are
         * maximally zoomedIn/zoomedOut, but that scale might not reflect the same precision as the calculatedMax/Min
         * values.
         */
        draft.scaleSettings.calculatedMinScale = Math.floor(calculatedMinScale);
        draft.scaleSettings.calculatedMaxScale = Math.ceil(calculatedMaxScale);

        draft.ready = true;
      }),
    ),
    on(MapConfigActions.setScale, (state, {scale}): MapConfigState => {
      return {...state, scale};
    }),
    on(MapConfigActions.resetExtent, (state): MapConfigState => {
      return {...state};
    }),
    on(MapConfigActions.changeZoom, (state): MapConfigState => {
      return {...state};
    }),
    on(MapConfigActions.setBasemap, (state, {activeBasemapId}): MapConfigState => {
      return {...state, activeBasemapId};
    }),
    on(MapConfigActions.clearInitialMapsConfig, (state): MapConfigState => {
      return {...state, initialMaps: []};
    }),
    on(MapConfigActions.setRotation, (state, {rotation}): MapConfigState => {
      return {...state, rotation: rotation};
    }),
    on(MapConfigActions.setReferenceDistance, (state, {referenceDistanceInMeters}): MapConfigState => {
      return {...state, referenceDistanceInMeters};
    }),
  ),
});

export const {
  name,
  reducer,
  selectIsMapServiceInitialized,
  selectMapConfigState,
  selectCenter,
  selectScale,
  selectSrsId,
  selectReady,
  selectIsMaxZoomedIn,
  selectIsMaxZoomedOut,
  selectActiveBasemapId,
  selectRotation,
  selectReferenceDistanceInMeters,
} = mapConfigFeature;
