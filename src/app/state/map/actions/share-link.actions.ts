import {createActionGroup, props} from '@ngrx/store';
import {ShareLinkItem} from '../../../shared/interfaces/share-link.interface';

export const ShareLinkActions = createActionGroup({
  source: 'ShareLink',
  events: {
    'Load Share Link Item': props<{shareLinkId: string}>(),
    'Set Share Link Item': props<{shareLinkItem: ShareLinkItem}>(),
    'Create Share Link Id': props<{shareLinkItem: ShareLinkItem}>(),
    'Set Share Link Id': props<{shareLinkId: string}>()
  }
});
