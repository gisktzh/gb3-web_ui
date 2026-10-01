import {createSelector} from '@ngrx/store';
import {selectData, selectHighlightedLayer} from '../reducers/statistics.reducer';
import {selectQueryMode} from '../reducers/query-mode.reducer';
import {selectIsMapServiceInitialized, selectReady} from '../reducers/map-config.reducer';

export const selectStatisticsHighlights = createSelector(
  selectData,
  selectHighlightedLayer,
  selectQueryMode,
  selectReady,
  selectIsMapServiceInitialized,
  (results, highlightedLayer, queryMode, ready, initialized) => {
    const geometry = highlightedLayer
      ? results.find((result) => result.topic === highlightedLayer.topic)?.layers.find((layer) => layer.layer === highlightedLayer.layer)
          ?.featureGeometry
      : undefined;
    return {
      ready: ready && initialized,
      queryMode,
      geometries: queryMode === 'statistics' && geometry ? [geometry] : [],
    };
  },
);
