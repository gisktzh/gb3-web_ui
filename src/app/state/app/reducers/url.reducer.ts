import {createFeature, createReducer, on} from '@ngrx/store';
import {UrlActions} from '../actions/url.actions';
import {UrlState} from '../states/url.state';

export const urlFeatureKey = 'url';

export const initialState: UrlState = {
  mainPage: undefined,
  previousPage: undefined,
  isHeadlessPage: false,
  isSimplifiedPage: false,
};

export const urlFeature = createFeature({
  name: urlFeatureKey,
  reducer: createReducer(
    initialState,
    on(UrlActions.setPage, (state, {mainPage, isHeadlessPage, isSimplifiedPage}): UrlState => {
      return {...state, previousPage: state.mainPage, mainPage, isHeadlessPage, isSimplifiedPage};
    }),
  ),
});

export const {name, reducer, selectUrlState, selectMainPage, selectIsHeadlessPage, selectIsSimplifiedPage} = urlFeature;
