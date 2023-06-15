import {createActionGroup, emptyProps, props} from '@ngrx/store';
import {ActiveMapItem, Gb2WmsActiveMapItem} from '../../../map/models/active-map-item.model';
import {LoadingState} from '../../../shared/types/loading-state';
import {ViewProcessState} from '../../../shared/types/view-process-state';
import {TimeExtent} from '../../../map/interfaces/time-extent.interface';

export const ActiveMapItemActions = createActionGroup({
  source: 'ActiveMapItem',
  events: {
    'Add Active Map Item': props<{activeMapItem: ActiveMapItem; position: number}>(),
    'Remove Active Map Item': props<ActiveMapItem>(),
    'Remove All Active Map Items': emptyProps(),
    'Set Opacity': props<{opacity: number; activeMapItem: ActiveMapItem}>(),
    'Set Visibility': props<{visible: boolean; activeMapItem: ActiveMapItem}>(),
    'Set Sublayer Visibility': props<{visible: boolean; activeMapItem: ActiveMapItem; layerId: number}>(),
    'Set Loading State': props<{loadingState: LoadingState; id: string}>(),
    'Set View Process State': props<{viewProcessState: ViewProcessState; id: string}>(),
    'Reorder Active Map Item': props<{previousPosition: number; currentPosition: number}>(),
    'Reorder Sublayer': props<{
      activeMapItem: ActiveMapItem;
      previousPosition: number;
      currentPosition: number;
    }>(),
    'Set Time Slider Extent': props<{timeExtent: TimeExtent; activeMapItem: Gb2WmsActiveMapItem}>(),
    'Set Attribute Filter Value State': props<{
      isFilterValueActive: boolean;
      filterValueName: string;
      attributeFilterParameter: string;
      activeMapItem: Gb2WmsActiveMapItem;
    }>(),
    'Add Favourite': props<{favourite: ActiveMapItem[]}>(),
    'Add Initial Map Items': props<{initialMapItems: ActiveMapItem[]}>(),
    'Mark All Active Map Item Notice As Read': emptyProps()
  }
});
