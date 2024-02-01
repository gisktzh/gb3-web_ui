import {createFeature, createReducer} from '@ngrx/store';
import {additionalInformationLinks} from '../../../shared/models/additional-information-links.data';
import {faqData} from '../../../shared/models/faq.data';
import {SupportContentState} from '../states/support-content.state';
import {usefulInformationLinks} from '../../../shared/models/useful-information-links.data';

export const supportContentFeatureKey = 'supportContent';

export const initialState: SupportContentState = {
  faq: faqData,
  additionalInformationLinks: additionalInformationLinks,
  usefulInformationLinks: usefulInformationLinks,
};

export const supportContentFeature = createFeature({
  name: supportContentFeatureKey,
  reducer: createReducer(initialState),
});

export const {name, reducer, selectAdditionalInformationLinks, selectFaq, selectUsefulInformationLinks} = supportContentFeature;
