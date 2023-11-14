import {createSelector} from '@ngrx/store';
import {selectFeatureInfosForDisplay} from './feature-info-result-display.selector';
import {selectQueryLocation} from '../reducers/feature-info.reducer';
import {FeatureInfoPrintConfiguration} from '../../../shared/interfaces/overlay-print.interface';

export const selectPrintFeatureInfoItems = createSelector(
  selectFeatureInfosForDisplay,
  selectQueryLocation,
  (featureInfoItems, {x, y}): FeatureInfoPrintConfiguration => {
    const items = featureInfoItems.map((legendItem) => ({topic: legendItem.mapId, layers: legendItem.layers.map((layer) => layer.layer)}));
    return {x, y, items};
  },
);
