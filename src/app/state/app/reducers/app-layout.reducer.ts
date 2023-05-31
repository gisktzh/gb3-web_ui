import {createFeature, createReducer, on} from '@ngrx/store';
import {AppLayoutState} from '../states/app-layout.state';
import {AppLayoutActions} from '../actions/app-layout.actions';

export const appLayoutFeatureKey = 'appLayout';

export const initialState: AppLayoutState = {
  scrollbarWidth: undefined
};

export const appLayoutFeature = createFeature({
  name: appLayoutFeatureKey,
  reducer: createReducer(
    initialState,
    on(AppLayoutActions.setScrollbarWidth, (state, {scrollbarWidth}): AppLayoutState => {
      if (state.scrollbarWidth !== undefined) {
        return state;
      }
      return {...state, scrollbarWidth: scrollbarWidth};
    })
  )
});

export const {name, reducer, selectAppLayoutState, selectScrollbarWidth} = appLayoutFeature;
