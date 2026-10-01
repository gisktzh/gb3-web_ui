import {createSelector} from '@ngrx/store';
import {selectData, selectHighlightedLayer} from '../reducers/statistics.reducer';
import {selectQueryMode} from '../reducers/query-mode.reducer';
import {selectMapGraphicsReady} from './query-graphics.selector';

export const selectStatisticsHighlights = createSelector(
  selectData,
  selectHighlightedLayer,
  selectQueryMode,
  selectMapGraphicsReady,
  (results, highlightedLayer, queryMode, ready) => {
    const geometry = highlightedLayer
      ? results.find((result) => result.topic === highlightedLayer.topic)?.layers.find((layer) => layer.layer === highlightedLayer.layer)
          ?.featureGeometry
      : undefined;
    return {
      ready,
      queryMode,
      geometries: queryMode === 'statistics' && geometry ? [geometry] : [],
    };
  },
);
