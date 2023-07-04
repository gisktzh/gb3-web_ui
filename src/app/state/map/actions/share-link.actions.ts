import {createActionGroup, props} from '@ngrx/store';
import {ShareLinkItem} from '../../../shared/interfaces/share-link.interface';

export const ShareLinkActions = createActionGroup({
  source: 'ShareLink',
  events: {
    'Load Share Link Item': props<{id: string}>(),
    'Set Share Link Item': props<{item: ShareLinkItem}>(),
    'Create Share Link Item': props<{item: ShareLinkItem}>(),
    'Set Share Link Id': props<{id: string}>()
  }
});
