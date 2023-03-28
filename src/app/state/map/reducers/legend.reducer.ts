import {createFeature, createReducer, on} from '@ngrx/store';
import {LegendActions} from '../actions/legend.actions';
import {HasLoadingState} from '../../../shared/interfaces/has-loading-state.interface';
import {Legend} from '../../../shared/interfaces/legend.interface';

export const legendFeatureKey = 'legend';

export interface LegendState extends HasLoadingState {
  legendItems: Legend[];
}

export const initialState: LegendState = {
  legendItems: [],
  loadingState: 'undefined'
};

export const legendFeature = createFeature({
  name: legendFeatureKey,
  reducer: createReducer(
    initialState,
    on(LegendActions.showLegend, (state): LegendState => {
      return {...state, loadingState: 'loading'};
    }),
    on(LegendActions.addLegendContent, (state, {legends}): LegendState => {
      const legendItems = legends.map((legend) => legend.legend);
      return {...state, loadingState: 'loaded', legendItems};
    }),
    on(LegendActions.hideLegend, (): LegendState => {
      return {...initialState};
    })
  )
});

export const {name, reducer, selectLegendState, selectLegendItems, selectLoadingState} = legendFeature;
