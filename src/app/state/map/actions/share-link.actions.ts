import {createActionGroup, props} from '@ngrx/store';
import {ShareLinkItem} from '../../../shared/interfaces/share-link.interface';
import {Topic} from '../../../shared/interfaces/topic.interface';
import {ActiveMapItem} from '../../../map/models/active-map-item.model';

export const ShareLinkActions = createActionGroup({
  source: 'ShareLink',
  events: {
    'Load Share Link Item': props<{id: string}>(),
    'Set Share Link Item': props<{item: ShareLinkItem}>(),
    'Create Share Link Item': props<{item: ShareLinkItem}>(),
    'Set Share Link Id': props<{id: string}>(),
    'Initialize Application Based On Share Link Id': props<{id: string}>(),
    'Validate Application Initialization': props<{item: ShareLinkItem; topics: Topic[]}>(),
    'Complete Application Initialization': props<{
      activeMapItems: ActiveMapItem[];
      basemapId: string;
      x: number;
      y: number;
      scale: number;
      errors: string[];
    }>(),
  },
});
