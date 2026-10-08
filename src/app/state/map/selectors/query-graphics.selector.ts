import {createSelector} from '@ngrx/store';
import {selectIsMapServiceInitialized, selectReady} from '../reducers/map-config.reducer';
import {selectQueryMode} from '../reducers/query-mode.reducer';
import {selectGeometry} from '../reducers/statistics.reducer';
import {selectHighlightedFeature} from '../reducers/feature-info.reducer';

export const selectMapGraphicsReady = createSelector(
  selectReady,
  selectIsMapServiceInitialized,
  (ready, initialized) => ready && initialized,
);

export const selectStatisticsAreaToDraw = createSelector(
  selectGeometry,
  selectQueryMode,
  selectMapGraphicsReady,
  (geometry, queryMode, ready) => ({ready, geometry: queryMode === 'statistics' ? geometry : undefined}),
);

export const selectFeatureHighlightToDraw = createSelector(
  selectHighlightedFeature,
  selectQueryMode,
  selectMapGraphicsReady,
  (geometry, queryMode, ready) => ({ready, geometry: queryMode === 'feature' ? geometry : undefined}),
);
