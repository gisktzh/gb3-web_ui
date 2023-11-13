import {createSelector} from '@ngrx/store';
import {selectMaps} from './maps.selector';
import {Map} from '../../../shared/interfaces/topic.interface';
import {selectItems} from '../reducers/active-map-item.reducer';
import {ActiveMapItem} from '../../../map/models/active-map-item.model';
import {selectData} from '../reducers/feature-info.reducer';
import {FeatureInfoResult, FeatureInfoResultDisplay} from '../../../shared/interfaces/feature-info.interface';
import {Gb2WmsActiveMapItem} from '../../../map/models/implementations/gb2-wms.model';
import {isActiveMapItemOfType} from '../../../shared/type-guards/active-map-item-type.type-guard';

export const selectFeatureInfosForDisplay = createSelector<
  Record<string, any>,
  FeatureInfoResult[],
  Map[],
  ActiveMapItem[],
  FeatureInfoResultDisplay[]
>(selectData, selectMaps, selectItems, (featureInfoResult, maps, activeMapItems) => {
  const featureInfoResultDisplays: FeatureInfoResultDisplay[] = [];
  featureInfoResult.forEach((featureInfo) => {
    // Abort if a featureinfo returned no hits for any of its layers.
    if (featureInfo.layers.every((featureInfoLayer) => featureInfoLayer.features.length === 0)) {
      return;
    }

    // Also abort if the featureInfo endpoint returns a non-matchable topic ID
    const topic = maps.find((map) => map.id === featureInfo.topic);
    if (!topic) {
      return;
    }

    // Also abort if the featureInfo isn't part of the active map items anymore
    const activeMapItem = activeMapItems
      .filter(isActiveMapItemOfType(Gb2WmsActiveMapItem))
      .find((item) => item.settings.mapId === featureInfo.topic);
    if (!activeMapItem) {
      return;
    }

    /*
      Currently, we cannot simply find out if we have a single layer featureinfo request. If only one layer is in the results, we need to
      check whether an activeMapItem exists as a single layer with this layer - otherwise, it's a topic with just one layer and this needs
      to be handled as a default layer itself.
      */

    // todo: There is a bug if a topic with only 1 layer AND this layer is also added as single layer - this will return true for all.
    let isSingleLayer = false;
    if (featureInfo.layers.length === 1) {
      const singleLayerId = Gb2WmsActiveMapItem.createSingleLayerId(topic.id, featureInfo.layers[0].layer);
      isSingleLayer = activeMapItems.some((a) => a.isSingleLayer && a.id === singleLayerId);
    }

    let featureInfoResultDisplay: FeatureInfoResultDisplay;
    if (isSingleLayer) {
      featureInfoResultDisplay = {
        id: Gb2WmsActiveMapItem.createSingleLayerId(topic.id, featureInfo.layers[0].layer),
        title: featureInfo.layers[0].title,
        layers: featureInfo.layers,
        icon: undefined,
        isSingleLayer: true,
        metaDataLink: featureInfo.metaDataLink,
        topicId: topic.id,
      };
    } else {
      featureInfoResultDisplay = {
        id: topic.id,
        title: topic.title,
        layers: featureInfo.layers,
        icon: topic.icon,
        isSingleLayer: false,
        metaDataLink: featureInfo.metaDataLink,
        topicId: topic.id,
      };
    }

    featureInfoResultDisplays.push(featureInfoResultDisplay);
  });
  return featureInfoResultDisplays;
});
