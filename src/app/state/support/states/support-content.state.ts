import {FaqCollection} from '../../../shared/interfaces/faq.interface';
import {SupportLinkCollection} from '../../../shared/interfaces/support-link.interface';

export interface SupportContentState {
  faq: FaqCollection[];
  links: SupportLinkCollection[];
}
