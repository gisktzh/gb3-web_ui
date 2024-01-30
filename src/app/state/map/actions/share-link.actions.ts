import {createActionGroup, emptyProps, props} from '@ngrx/store';
import {ShareLinkItem} from '../../../shared/interfaces/share-link.interface';
import {errorProps} from '../../../shared/utils/error-props.utils';
import {MapRestoreItem} from '../../../shared/interfaces/map-restore-item.interface';

export const ShareLinkActions = createActionGroup({
  source: 'ShareLink',
  events: {
    'Load Item': props<{id: string}>(),
    'Set Loading Error': errorProps(),
    'Set Item': props<{item: ShareLinkItem}>(),

    'Create Item': props<{item: ShareLinkItem}>(),
    'Set Creation Error': errorProps(),
    'Set Item Id': props<{id: string}>(),

    'Validate item': props<{item: ShareLinkItem}>(),
    'Set Validation Error': errorProps(),
    'Complete Validation': props<{mapRestoreItem: MapRestoreItem}>(),

    'Initialize Application Based On Id': props<{id: string}>(),
    'Set Initialization Error': errorProps(),
    'Complete Application Initialization': emptyProps(),
  },
});
