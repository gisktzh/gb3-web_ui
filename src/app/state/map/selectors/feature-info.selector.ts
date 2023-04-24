import {createSelector} from '@ngrx/store';
import {selectMaps} from './maps.selector';
import {Map} from '../../../shared/interfaces/topic.interface';
import {selectActiveMapItems} from '../reducers/active-map-item.reducer';
import {ActiveMapItem} from '../../../map/models/active-map-item.model';
import {selectData} from '../reducers/feature-info.reducer';
import {FeatureInfoResult, FeatureInfoResultDisplay} from '../../../shared/interfaces/feature-info.interface';

export const selectDetailedFeatureInfo = createSelector<
  Record<string, any>,
  FeatureInfoResult[],
  Map[],
  ActiveMapItem[],
  FeatureInfoResultDisplay[]
>(selectData, selectMaps, selectActiveMapItems, (featureInfoResult, maps, activeMapItems) => {
  const legendDisplays: FeatureInfoResultDisplay[] = [];
  featureInfoResult.forEach((featureInfo) => {
    // Abort if a featureinfo returned no hits for any of its layers.
    if (featureInfo.layers.every((featureInfoLayer) => featureInfoLayer.features.length === 0)) {
      return;
    }

    let isSingleLayer = false;
    let legendDisplay: FeatureInfoResultDisplay;
    const topic = maps.find((map) => map.id === featureInfo.topic);

    if (!topic) {
      // Just in case the legend endpoint somehow fails, we avoid type errors by returning early and not showing any legend at all
      return;
    }

    // Currently, we cannot simply find out if we have a single layer legend request. If only one item is in the legendItem, we need to
    // check whether an activeMapItem exists as a single layer with this layer - otherwise, it's a topic with just one layer and this
    // needs to be handled as a default layer itself.
    if (featureInfo.layers.length === 1) {
      const singleLayerName = ActiveMapItem.getSingleLayerName(topic.id, featureInfo.layers[0].layer);
      isSingleLayer = !!activeMapItems.find((a) => a.isSingleLayer && a.id === singleLayerName);
    }

    if (isSingleLayer) {
      legendDisplay = {
        title: featureInfo.layers[0].title,
        layers: featureInfo.layers,
        icon: undefined,
        isSingleLayer: true
        //metaDataLink: featureInfo.layers[0].metaDataLink // make sure we take the layer's metaDataLink and not its topic's one
      };
    } else {
      legendDisplay = {
        title: topic.title,
        layers: featureInfo.layers,
        icon: topic.icon,
        isSingleLayer: false
        //metaDataLink: featureInfo.metaDataLink
      };
    }

    legendDisplays.push(legendDisplay);
  });
  return legendDisplays;
});
