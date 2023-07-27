import {LoadingState} from '../../shared/types/loading-state';
import {HasLoadingState} from '../../shared/interfaces/has-loading-state.interface';
import {HasVisibility} from '../interfaces/has-visibility.interface';
import {HasViewProcessState} from '../interfaces/has-view-process-state.interface';
import {ViewProcessState} from '../../shared/types/view-process-state';
import {IsImmerable} from '../interfaces/immerable.interface';
import {immerable} from 'immer';

import {AddToMapVisitor} from '../interfaces/add-to-map.visitor';
import {Gb2WmsSettings} from './implementations/gb2-wms.model';
import {DrawingLayerSettings} from './implementations/drawing.model';

type ActiveMapItemSettingsType = 'gb2Wms' | 'drawing';

export abstract class AbstractActiveMapItemSettings implements IsImmerable {
  public readonly [immerable] = true;
  public abstract readonly type: ActiveMapItemSettingsType;
}

export type ActiveMapItemSettings = Gb2WmsSettings | DrawingLayerSettings;

export abstract class ActiveMapItem implements HasLoadingState, HasVisibility, HasViewProcessState, IsImmerable {
  public abstract readonly id: string;
  public abstract readonly title: string;
  public abstract readonly mapImageUrl: string | null;
  public abstract readonly settings: ActiveMapItemSettings;
  public abstract readonly isSingleLayer: boolean;
  public abstract readonly geometadataId: number | null;

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
   * @param addToMapVisitor Visitor implementation which can be used to add the ActiveMapItem to the map
   * @param position The position where the item should be added on the map
   */
  public abstract addToMap(addToMapVisitor: AddToMapVisitor, position: number): void;
}
