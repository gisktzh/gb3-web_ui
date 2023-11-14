import {createSelector} from '@ngrx/store';
import {selectLegendItemsForDisplay} from './legend-result-display.selector';
import {PrintableOverlayItem} from '../../../shared/interfaces/overlay-print.interface';

export const selectPrintLegendItems = createSelector(selectLegendItemsForDisplay, (legendItems): PrintableOverlayItem[] => {
  return legendItems.map((legendItem) => ({topic: legendItem.mapId, layers: legendItem.layers.map((layer) => layer.layer)}));
});
