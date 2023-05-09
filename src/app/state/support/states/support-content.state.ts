import {FaqCollection} from '../../../shared/interfaces/faq.interface';
import {LinksGroup} from '../../../shared/interfaces/support-link.interface';

export interface SupportContentState {
  faq: FaqCollection[];
  links: LinksGroup[];
}
