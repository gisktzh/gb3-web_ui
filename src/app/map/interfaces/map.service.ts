import {Geometry} from 'geojson';
import {Topic, TopicLayer} from '../../shared/interfaces/topic.interface';

export interface MapService {
  init(): void;
  assignMapElement(container: HTMLDivElement): void;

  setScale(scale: number): void;
  resetExtent(): void;

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
