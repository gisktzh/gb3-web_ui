import {createSelector} from '@ngrx/store';
import {selectLegendItems} from '../reducers/legend.reducer';
import {selectMaps} from './maps.selector';
import {Legend, LegendDisplay} from '../../../shared/interfaces/legend.interface';
import {Map} from '../../../shared/interfaces/topic.interface';
import {selectActiveMapItems} from '../reducers/active-map-item.reducer';
import {ActiveMapItem} from '../../../map/models/active-map-item.model';

export const selectDetailedLegends = createSelector<Record<string, any>, Legend[], Map[], ActiveMapItem[], LegendDisplay[]>(
  selectLegendItems,
  selectMaps,
  selectActiveMapItems,
  (legendItems, maps, activeMapItems) => {
    const legendDisplays: LegendDisplay[] = [];
    legendItems.forEach((legendItem) => {
      let isSingleLayer = false;
      let legendDisplay: LegendDisplay;
      const topic = maps.find((map) => map.id === legendItem.topic);

      if (!topic) {
        // Just in case the legend endpoint somehow fails, we avoid type errors by returning early and not showing any legend at all
        return;
      }

      // Currently, we cannot simply find out if we have a single layer legend request. If only one item is in the legendItem, we need to
      // check whether an activeMapItem exists as a single layer with this layer - otherwise, it's a topic with just one layer and this needs
      // to be handled as a default layer itself.
      if (legendItem.layers.length === 1) {
        const singleLayerName = ActiveMapItem.getSingleLayerName(topic.id, legendItem.layers[0].layer);
        isSingleLayer = !!activeMapItems.find((a) => a.isSingleLayer && a.id === singleLayerName);
      }

      if (isSingleLayer) {
        legendDisplay = {
          title: legendItem.layers[0].title,
          layers: legendItem.layers,
          icon: undefined,
          isSingleLayer: true
        };
      } else {
        legendDisplay = {
          title: topic.title,
          layers: legendItem.layers,
          icon: topic.icon,
          isSingleLayer: false
        };
      }

      legendDisplays.push(legendDisplay);
    });
    return legendDisplays;
  }
);
