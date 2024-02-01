import {FaqCollection} from '../../../shared/interfaces/faq.interface';
import {LinksGroup} from '../../../shared/interfaces/links-group.interface';

export interface SupportContentState {
  faq: FaqCollection[];
  additionalInformationLinks: LinksGroup[];
  usefulInformationLinks: LinksGroup[];
}
