import {Geometry} from 'geojson';
import {ActiveMapItem} from '../models/active-map-item.model';

export interface MapService {
  init(): void;
  assignMapElement(container: HTMLDivElement): void;

  addMapItem(mapItem: ActiveMapItem): void;
  removeMapItem(id: string): void;
  removeAllTopics(): void;

  // moveTopic(topic: Topic, position: number): void;

  // setTopicVisibility(visibility: boolean, topic: Topic, layer?: TopicLayer): void;
  // setSingleLayerVisibility(visibility: boolean, topic: Topic, layer: TopicLayer): void;

  // setOpacity(opacity: number, topic: Topic, layer?: TopicLayer): void;

  addHighlightGeometry(geometry: Geometry): void;
  removeAllHighlightGeometries(): void;
}
