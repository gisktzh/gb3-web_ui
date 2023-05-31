import {createFeature, createReducer, on} from '@ngrx/store';
import {GeneralInfoState} from '../states/general-info.state';
import {GeneralInfoActions} from '../actions/general-info.actions';

export const generalInfoFeatureKey = 'generalInfo';

export const initialState: GeneralInfoState = {
  loadingState: 'undefined',
  data: undefined
};

export const generalInfoFeature = createFeature({
  name: generalInfoFeatureKey,
  reducer: createReducer(
    initialState,
    on(GeneralInfoActions.sendRequest, (): GeneralInfoState => {
      return {...initialState, loadingState: 'loading'};
    }),
    on(GeneralInfoActions.clearGeneralInfoContent, (): GeneralInfoState => {
      return {...initialState};
    }),
    on(GeneralInfoActions.updateGeneralInfo, (state, {generalInfo}): GeneralInfoState => {
      return {...state, loadingState: 'loaded', data: generalInfo};
    })
  )
});

export const {name, reducer, selectGeneralInfoState, selectLoadingState, selectData} = generalInfoFeature;
