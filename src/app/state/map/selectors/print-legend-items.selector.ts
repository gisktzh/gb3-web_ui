import {createSelector} from '@ngrx/store';
import {selectLegendItemsForDisplay} from './legend-result-display.selector';
import {LegendDisplay} from '../../../shared/interfaces/legend.interface';
import {PrintLegendItem} from '../../../shared/interfaces/overlay-print.interface';

export const selectPrintLegendItems = createSelector<Record<string, any>, LegendDisplay[], PrintLegendItem[]>(
  selectLegendItemsForDisplay,
  (legendItems) => {
    return legendItems.map((legendItem) => ({topic: legendItem.id, layers: legendItem.layers.map((layer) => layer.layer)}));
  },
);
