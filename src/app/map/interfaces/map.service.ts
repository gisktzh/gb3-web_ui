import {Topic, TopicLayer} from '../../shared/models/gb3-api.interfaces';
import {Geometry} from 'geojson';

export interface MapService {
  init(): void;
  assignMapElement(container: HTMLDivElement): void;

  addTopic(topic: Topic): void;
  addTopicLayer(topic: Topic, layer: TopicLayer): void;

  removeTopic(topic: Topic): void;
  removeTopicLayer(topic: Topic, layer: TopicLayer): void;

  removeAllTopics(): void;

  // moveTopic(topic: Topic, position: number): void;

  // setTopicVisibility(visibility: boolean, topic: Topic, layer?: TopicLayer): void;
  // setSingleLayerVisibility(visibility: boolean, topic: Topic, layer: TopicLayer): void;

  // setOpacity(opacity: number, topic: Topic, layer?: TopicLayer): void;

  addHighlightGeometry(geometry: Geometry): void;
  removeAllHighlightGeometries(): void;
}
