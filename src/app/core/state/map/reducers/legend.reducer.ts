import {createFeature, createReducer, on} from '@ngrx/store';
import {LegendActions} from '../actions/legend.actions';
import {Legend} from '../../../../shared/services/apis/gb3/gb3-api.interfaces';

export const legendFeatureKey = 'legend';

export interface LegendState {
  visible: boolean;
  legendItems: Legend[];
}

export const initialState: LegendState = {
  visible: false,
  legendItems: []
};

export const legendFeature = createFeature({
  name: legendFeatureKey,
  reducer: createReducer(
    initialState,
    on(LegendActions.toggleDisplay, (state): LegendState => {
      return {...state, visible: !state.visible};
    }),
    on(LegendActions.addLegendContent, (state, {legend}): LegendState => {
      // todo: once the layers are loaded from the API, this method should append it to the layerlist
      const otherLegendItems = state.legendItems.filter((item) => item.topic !== legend.topic);
      return {...state, legendItems: [...otherLegendItems, legend]};
    }),
    on(LegendActions.clearLegendContent, (state): LegendState => {
      return {...state, legendItems: []};
    })
  )
});

export const {name, reducer, selectLegendState, selectVisible, selectLegendItems} = legendFeature;
