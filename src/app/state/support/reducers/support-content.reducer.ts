import {createFeature, createReducer} from '@ngrx/store';
import {supportLinks} from '../../../shared/models/support-links.data';
import {faqData} from '../../../shared/models/faq.data';
import {SupportContentState} from '../states/support-content.state';

export const supportContentFeatureKey = 'supportContent';

export const initialState: SupportContentState = {
  faq: faqData,
  links: supportLinks,
};

export const supportContentFeature = createFeature({
  name: supportContentFeatureKey,
  reducer: createReducer(initialState),
});

export const {name, reducer, selectLinks, selectFaq} = supportContentFeature;
