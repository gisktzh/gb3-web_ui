import {LoadingState} from '../../shared/types/loading-state.type';
import {HasLoadingState} from '../../shared/interfaces/has-loading-state.interface';
import {HasVisibility} from '../interfaces/has-visibility.interface';
import {HasViewProcessState} from '../interfaces/has-view-process-state.interface';
import {ViewProcessState} from '../../shared/types/view-process-state.type';
import {IsImmerable} from '../interfaces/immerable.interface';
import {immerable} from 'immer';
import {AddToMapVisitor} from '../interfaces/add-to-map.visitor';
import {Gb2WmsSettings} from './implementations/gb2-wms.model';
import {DrawingLayerSettings} from './implementations/drawing.model';
import {IsSingleLayer} from '../../shared/interfaces/single-layer.interface';
import {ExternalServiceSettings} from './external-service.model';
import {HasOpacity} from '../interfaces/has-opacity.interface';

type ActiveMapItemSettingsType = 'gb2Wms' | 'drawing' | 'externalService';

export abstract class AbstractActiveMapItemSettings implements IsImmerable {
  public readonly [immerable] = true;
  public abstract readonly type: ActiveMapItemSettingsType;
}

export type ActiveMapItemSettings = Gb2WmsSettings | DrawingLayerSettings | ExternalServiceSettings;

export abstract class ActiveMapItem implements HasLoadingState, HasOpacity, HasVisibility, HasViewProcessState, IsImmerable, IsSingleLayer {
  public abstract readonly id: string;
  public abstract readonly title: string;
  public abstract readonly mapImageUrl: string | null;
  public abstract readonly settings: ActiveMapItemSettings;
  public abstract readonly isSingleLayer: boolean;
  public abstract readonly geometadataUuid: string | null;

  public readonly [immerable] = true;
  public visible: boolean;
  public opacity: number;
  public loadingState: LoadingState;
  public viewProcessState: ViewProcessState;
  /**
   * A temporary item is an active map item that should not be shown in the list of active map items, i.e. during hover state
   */
  public isTemporary: boolean;

  protected constructor(visible?: boolean, opacity?: number, isTemporary?: boolean) {
    this.visible = visible ?? true;
    this.opacity = opacity ?? 1;
    this.isTemporary = isTemporary ?? false;
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
