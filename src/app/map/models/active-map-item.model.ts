import {LoadingState} from '../../shared/types/loading-state';
import {HasLoadingState} from '../../shared/interfaces/has-loading-state.interface';
import {HasVisibility} from '../../shared/interfaces/has-visibility.interface';
import {HasViewProcessState} from '../../shared/interfaces/has-view-process-state.interface';
import {ViewProcessState} from '../../shared/types/view-process-state';
import {IsImmerable} from '../../shared/interfaces/immerable.interface';
import {immerable} from 'immer';

import {AddToMapVisitor} from '../interfaces/add-to-map.visitor';
import {Gb2WmsMapItemConfiguration} from './implementations/gb2-wms.model';
import {DrawingLayerTestConfiguration} from './implementations/drawing-test.model';

type ActiveMapItemType = 'gb2Wms' | 'drawing';

export abstract class AbstractActiveMapItemConfiguration implements IsImmerable {
  public readonly [immerable] = true;
  public abstract readonly type: ActiveMapItemType;
}

export type ActiveMapItemConfiguration = Gb2WmsMapItemConfiguration | DrawingLayerTestConfiguration;

export abstract class ActiveMapItem implements HasLoadingState, HasVisibility, HasViewProcessState, IsImmerable {
  public abstract readonly id: string;
  public abstract readonly title: string;
  public abstract readonly mapImageUrl: string;
  public abstract readonly configuration: ActiveMapItemConfiguration;
  public abstract readonly isSingleLayer: boolean;

  public readonly [immerable] = true;
  public visible: boolean;
  public opacity: number;
  public loadingState: LoadingState = 'undefined';
  public viewProcessState: ViewProcessState = 'undefined';

  protected constructor(visible?: boolean, opacity?: number) {
    this.visible = visible ?? true;
    this.opacity = opacity ?? 1;
  }

  /**
   * Takes an addToMapVisitor and calls the appropriate submethod. This is a variation of the Visitor pattern in that the MapService
   * implements this interface and can handle different types of map to be added, without having to use switch cases.
   *
   * @param addToMapVisitor
   * @param position
   */
  public abstract addToMap(addToMapVisitor: AddToMapVisitor, position: number): void;
}
