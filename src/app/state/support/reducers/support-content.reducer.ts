import {createFeature, createReducer} from '@ngrx/store';
import {supportLinks} from '../../../shared/models/support-links.data';
import {SupportLinkCollection} from '../../../shared/interfaces/support-link.interface';

export const supportContentFeatureKey = 'supportContent';

export interface SupportContentState {
  links: SupportLinkCollection[];
}

export const initialState: SupportContentState = {
  links: supportLinks
};

export const supportContentFeature = createFeature({
  name: supportContentFeatureKey,
  reducer: createReducer(initialState)
});

export const {name, reducer, selectSupportContentState, selectLinks} = supportContentFeature;
