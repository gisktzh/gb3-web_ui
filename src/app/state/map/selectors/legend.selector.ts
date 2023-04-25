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
      // Abort if the legend endpoint returns a non-matchable topic ID
      const topic = maps.find((map) => map.id === legendItem.topic);
      if (!topic) {
        return;
      }

      /*
      Currently, we cannot simply find out if we have a single layer legend request. If only one item is in the legendItem, we need to
      check whether an activeMapItem exists as a single layer with this layer - otherwise, it's a topic with just one layer and this needs
      to be handled as a default layer itself.
      */
      let isSingleLayer = false;
      if (legendItem.layers.length === 1) {
        const singleLayerName = ActiveMapItem.getSingleLayerName(topic.id, legendItem.layers[0].layer);
        isSingleLayer = !!activeMapItems.find((a) => a.isSingleLayer && a.id === singleLayerName);
      }

      let legendDisplay: LegendDisplay;
      if (isSingleLayer) {
        legendDisplay = {
          title: legendItem.layers[0].title,
          layers: legendItem.layers,
          icon: undefined,
          isSingleLayer: true,
          metaDataLink: legendItem.layers[0].metaDataLink // make sure we take the layer's metaDataLink and not its topic's one
        };
      } else {
        legendDisplay = {
          title: topic.title,
          layers: legendItem.layers,
          icon: topic.icon,
          isSingleLayer: false,
          metaDataLink: legendItem.metaDataLink
        };
      }

      legendDisplays.push(legendDisplay);
    });
    return legendDisplays;
  }
);
