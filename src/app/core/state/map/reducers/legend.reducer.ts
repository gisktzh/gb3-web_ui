import {createFeature, createReducer, on} from '@ngrx/store';
import {LegendActions} from '../actions/legend.actions';
import {HasLoadingState} from '../../../../shared/interfaces/has-loading-state.interface';
import {LoadingState} from '../../../../shared/enums/loading-state';
import {Legend} from '../../../../shared/interfaces/legend.interface';

export const legendFeatureKey = 'legend';

export interface LegendState extends HasLoadingState {
  legendItems: Legend[];
}

export const initialState: LegendState = {
  legendItems: [],
  loadingState: LoadingState.UNDEFINED
};

export const legendFeature = createFeature({
  name: legendFeatureKey,
  reducer: createReducer(
    initialState,
    on(LegendActions.showLegend, (state): LegendState => {
      return {...state, loadingState: LoadingState.LOADING};
    }),
    on(LegendActions.addLegendContent, (state, {legends}): LegendState => {
      const legendItems = legends.map((legend) => legend.legend);
      return {...state, loadingState: LoadingState.LOADED, legendItems};
    }),
    on(LegendActions.hideLegend, (): LegendState => {
      return {...initialState};
    })
  )
});

export const {name, reducer, selectLegendState, selectLegendItems, selectLoadingState} = legendFeature;
