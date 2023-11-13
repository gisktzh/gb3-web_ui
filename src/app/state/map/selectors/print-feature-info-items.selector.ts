import {createSelector} from '@ngrx/store';
import {selectFeatureInfosForDisplay} from './feature-info-result-display.selector';
import {selectQueryLocation} from '../reducers/feature-info.reducer';

export const selectPrintFeatureInfoItems = createSelector(selectFeatureInfosForDisplay, selectQueryLocation, (featureInfoItems, {x, y}) => {
  const items = featureInfoItems.map((legendItem) => ({topic: legendItem.id, layers: legendItem.layers.map((layer) => layer.layer)}));
  return {x, y, items};
});
