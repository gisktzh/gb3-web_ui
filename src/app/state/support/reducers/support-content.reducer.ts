import {createFeature, createReducer} from '@ngrx/store';
import {supportLinks} from '../../../shared/models/support-links.data';
import {SupportLinkCollection} from '../../../shared/interfaces/support-link.interface';
import {FaqCollection} from '../../../shared/interfaces/faq.interface';
import {faqData} from '../../../shared/models/faq.data';

export const supportContentFeatureKey = 'supportContent';

export interface SupportContentState {
  faq: FaqCollection[];
  links: SupportLinkCollection[];
}

export const initialState: SupportContentState = {
  faq: faqData,
  links: supportLinks
};

export const supportContentFeature = createFeature({
  name: supportContentFeatureKey,
  reducer: createReducer(initialState)
});

export const {name, reducer, selectLinks, selectFaq} = supportContentFeature;
