import {createActionGroup, emptyProps, props} from '@ngrx/store';
import {ActiveMapItem} from '../../../../map/models/active-map-item.model';
import {LoadingState} from '../../../../shared/types/loading-state';
import {ViewProcessState} from '../../../../shared/types/view-process-state';

export const ActiveMapItemActions = createActionGroup({
  source: 'ActiveMapItem',
  events: {
    'Add Active Map Item': props<ActiveMapItem>(),
    'Remove Active Map Item': props<ActiveMapItem>(),
    'Remove All Active Map Items': emptyProps(),
    'Set Opacity': props<{opacity: number; activeMapItem: ActiveMapItem}>(),
    'Set Visibility': props<{visible: boolean; activeMapItem: ActiveMapItem}>(),
    'Set Sublayer Visibility': props<{visible: boolean; activeMapItem: ActiveMapItem; layerId: number}>(),
    'Set Loading State': props<{loadingState: LoadingState; id: string}>(),
    'Set View Process State': props<{viewProcessState: ViewProcessState; id: string}>(),
    'Reorder Active Map Item': props<{previousIndex: number; currentIndex: number}>(),
    'Reorder Sublayer': props<{activeMapItem: ActiveMapItem; previousIndex: number; currentIndex: number}>()
  }
});
