import {HasSavingState} from '../../../shared/interfaces/has-saving-state.interface';
import {ShareLinkItem} from '../../../shared/interfaces/share-link.interface';
import {HasLoadingState} from '../../../shared/interfaces/has-loading-state.interface';

export interface ShareLinkState extends HasLoadingState, HasSavingState {
  shareLinkItem: ShareLinkItem | undefined;
  shareLinkId: string | undefined;
}
