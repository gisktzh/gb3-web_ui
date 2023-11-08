import {createFeature, createReducer, on} from '@ngrx/store';
import {AppLayoutState} from '../states/app-layout.state';
import {AppLayoutActions} from '../actions/app-layout.actions';

export const appLayoutFeatureKey = 'appLayout';

export const initialState: AppLayoutState = {
  scrollbarWidth: undefined,
  screenMode: 'regular',
  screenHeight: 'regular',
};

export const appLayoutFeature = createFeature({
  name: appLayoutFeatureKey,
  reducer: createReducer(
    initialState,
    on(AppLayoutActions.setScrollbarWidth, (state, {scrollbarWidth}): AppLayoutState => {
      if (state.scrollbarWidth !== initialState.scrollbarWidth) {
        // only change the state once as the scrollbar will only be measured once
        // all further changes will be ignored
        return state;
      }
      return {...state, scrollbarWidth: scrollbarWidth};
    }),
    on(AppLayoutActions.setScreenMode, (state, {screenMode, screenHeight}): AppLayoutState => {
      return {...state, screenMode, screenHeight};
    }),
  ),
});

export const {name, reducer, selectAppLayoutState, selectScrollbarWidth, selectScreenMode, selectScreenHeight} = appLayoutFeature;
