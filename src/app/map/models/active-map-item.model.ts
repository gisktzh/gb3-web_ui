import {LoadingState} from '../../shared/types/loading-state';
import {Map, MapLayer} from '../../shared/interfaces/topic.interface';
import {HasLoadingState} from '../../shared/interfaces/has-loading-state.interface';
import {HasVisibility} from '../../shared/interfaces/has-visibility.interface';
import {HasViewProcessState} from '../../shared/interfaces/has-view-process-state.interface';
import {ViewProcessState} from '../../shared/types/view-process-state';

export class ActiveMapItem implements HasLoadingState, HasVisibility, HasViewProcessState {
  public readonly id: string;
  public readonly title: string;
  public readonly url: string;

  public readonly topic: string;
  public readonly layers: MapLayer[];
  public readonly isSingleLayer: boolean;

  public loadingState: LoadingState = 'undefined';
  public viewProcessState: ViewProcessState = 'undefined';
  public visible = true;
  public opacity = 1;

  constructor(topic: Map, layer?: MapLayer) {
    this.isSingleLayer = !!layer;
    this.id = layer ? `${topic.id}_${layer.layer}` : topic.id;
    this.title = layer ? layer.title : topic.title;
    this.url = topic.wmsUrl;
    this.topic = topic.id;
    this.layers = layer ? [layer] : topic.layers;
  }
}
