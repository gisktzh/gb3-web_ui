import {createFeature, createReducer, on} from '@ngrx/store';
import {LegendActions} from '../actions/legend.actions';

export const legendFeatureKey = 'legend';

export interface LegendState {
  visible: boolean;
}

export const initialState: LegendState = {
  visible: false
};

export const legendFeature = createFeature({
  name: legendFeatureKey,
  reducer: createReducer(
    initialState,
    on(LegendActions.toggleDisplay, (state): LegendState => {
      return {...state, visible: !state.visible};
    })
  )
});

export const {name, reducer, selectLegendState, selectVisible} = legendFeature;
