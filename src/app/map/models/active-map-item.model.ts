import {LoadingState} from '../../shared/types/loading-state';
import {Topic, TopicLayer} from '../../shared/interfaces/topic.interface';
import {HasLoadingState} from '../../shared/interfaces/has-loading-state.interface';
import {HasVisibility} from '../../shared/interfaces/has-visibility.interface';

export class ActiveMapItem implements HasLoadingState, HasVisibility {
  public readonly id: string;
  public readonly title: string;
  public readonly url: string;

  public readonly topic: string;
  public readonly layers: TopicLayer[];
  public readonly isSingleLayer: boolean;

  public loadingState: LoadingState = 'undefined';
  public visible = true;
  public opacity = 1;

  constructor(topic: Topic, layer?: TopicLayer) {
    this.isSingleLayer = !!layer;
    this.id = layer ? `${topic.topic}_${layer.layer}` : topic.topic;
    this.title = layer ? layer.title : topic.title;
    this.url = topic.wmsUrl;
    this.topic = topic.topic;
    this.layers = layer ? [layer] : topic.layers;
  }
}
