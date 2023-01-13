import {LoadingState} from '../../shared/enums/loading-state';
import {Topic, TopicLayer} from '../../shared/models/gb3-api.interfaces';

export class ActiveMapItem {
  public readonly topic: Topic;
  public readonly layer?: TopicLayer;

  public loadingState = LoadingState.UNDEFINED;
  public opacity = 1;
  public visible = true;

  constructor(topic: Topic, layer?: TopicLayer) {
    this.topic = topic;
    this.layer = layer;
  }

  public static isSameMapItem(activeMapItem: ActiveMapItem, otherActiveMapItem: ActiveMapItem): boolean {
    return activeMapItem.topic.topic === otherActiveMapItem.topic.topic && activeMapItem.layer?.layer === otherActiveMapItem.layer?.layer;
  }
}
