import {createActionGroup, emptyProps, props} from '@ngrx/store';
import {ActiveMapItem} from '../../../map/models/active-map-item.model';
import {LoadingState} from '../../../shared/types/loading-state.type';
import {ViewProcessState} from '../../../shared/types/view-process-state.type';
import {TimeExtent} from '../../../map/interfaces/time-extent.interface';
import {Gb2WmsActiveMapItem} from '../../../map/models/implementations/gb2-wms.model';
import {FavouriteBaseConfig} from '../../../shared/interfaces/favourite.interface';

export const ActiveMapItemActions = createActionGroup({
  source: 'ActiveMapItem',
  events: {
    'Add Active Map Item': props<{activeMapItem: ActiveMapItem; position: number}>(),
    'Remove Active Map Item': props<ActiveMapItem>(),
    'Remove All Active Map Items': emptyProps(),
    'Force Full Visibility': props<{activeMapItem: ActiveMapItem}>(),
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
    'Move To Top': props<{activeMapItem: ActiveMapItem}>(),
    'Set Time Slider Extent': props<{timeExtent: TimeExtent; activeMapItem: Gb2WmsActiveMapItem}>(),
    'Set Attribute Filter Value State': props<{
      isFilterValueActive: boolean;
      filterValueName: string;
      attributeFilterParameter: string;
      activeMapItem: Gb2WmsActiveMapItem;
    }>(),
    'Add Favourite': props<{activeMapItems: ActiveMapItem[]; baseConfig: FavouriteBaseConfig}>(),
    'Add Initial Map Items': props<{initialMapItems: ActiveMapItem[]}>(),
    'Mark All Active Map Item Notice As Read': emptyProps(),
    /**
     * This action does not have an effect to add items to the map in contrast to the other 'add' actions.
     * It can be used to prepare a pre-filled list of active map items to show **before** routing to the map tab
     * This is the same behaviour as changing tabs and then coming back to the 'maps' tab while still having some
     * previously loaded items.
     */
    'Initialize Active Map Items': props<{activeMapItems: ActiveMapItem[]}>(),
  },
});
