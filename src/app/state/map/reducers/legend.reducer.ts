import {createFeature, createReducer, on} from '@ngrx/store';
import {LegendActions} from '../actions/legend.actions';
import {LegendState} from '../states/legend.state';

export const legendFeatureKey = 'legend';

export const initialState: LegendState = {
  items: [],
  loadingState: undefined,
};

export const legendFeature = createFeature({
  name: legendFeatureKey,
  reducer: createReducer(
    initialState,
    on(LegendActions.loadLegend, (state): LegendState => {
      return {...state, loadingState: 'loading'};
    }),
    on(LegendActions.addLegendContent, (state, {legends}): LegendState => {
      const legendItems = legends.map((legend) => legend.legend);
      return {...state, loadingState: 'loaded', items: legendItems};
    }),
    on(LegendActions.clearLegend, (): LegendState => {
      return {...initialState};
    }),
    on(LegendActions.setError, (): LegendState => {
      return {...initialState, loadingState: 'error'};
    }),
  ),
});

export const {name, reducer, selectLegendState, selectItems, selectLoadingState} = legendFeature;
