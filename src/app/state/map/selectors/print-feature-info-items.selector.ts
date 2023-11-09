import {createSelector} from '@ngrx/store';
import {FeatureInfoPrintConfiguration} from '../../../shared/interfaces/overlay-print.interface';
import {selectFeatureInfosForDisplay} from './feature-info-result-display.selector';
import {FeatureInfoQueryLocation, FeatureInfoResultDisplay} from '../../../shared/interfaces/feature-info.interface';
import {selectQueryLocation} from '../reducers/feature-info.reducer';

export const selectPrintFeatureInfoItems = createSelector<
  Record<string, any>,
  FeatureInfoResultDisplay[],
  FeatureInfoQueryLocation,
  FeatureInfoPrintConfiguration
>(selectFeatureInfosForDisplay, selectQueryLocation, (featureInfoItems, {x, y}) => {
  const items = featureInfoItems.map((legendItem) => ({topic: legendItem.id, layers: legendItem.layers.map((layer) => layer.layer)}));
  return {x, y, items};
});
