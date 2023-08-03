import {createActionGroup, emptyProps, props} from '@ngrx/store';
import {ShareLinkItem} from '../../../shared/interfaces/share-link.interface';
import {Topic} from '../../../shared/interfaces/topic.interface';
import {ActiveMapItem} from '../../../map/models/active-map-item.model';
import {errorProps} from '../../../shared/utils/error-props.utils';

export const ShareLinkActions = createActionGroup({
  source: 'ShareLink',
  events: {
    // load item
    'Load Item': props<{id: string}>(),
    'Set Loading Error': errorProps(),
    'Set Item': props<{item: ShareLinkItem}>(),

    // create item
    'Create Item': props<{item: ShareLinkItem}>(),
    'Set Creation Error': errorProps(),
    'Set Item Id': props<{id: string}>(),

    // item validation
    'Validate item': props<{item: ShareLinkItem; topics: Topic[]}>(),
    'Set Validation Error': errorProps(),
    'Complete Validation': props<{
      activeMapItems: ActiveMapItem[];
      basemapId: string;
      x: number;
      y: number;
      scale: number;
    }>(),

    // initialize application based on item
    'Initialize Application Based On Id': props<{id: string}>(),
    'Set Initialization Error': errorProps(),
    'Complete Application Initialization': emptyProps(),
  },
});
