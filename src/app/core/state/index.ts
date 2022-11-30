import {ActionReducerMap, MetaReducer} from '@ngrx/store';
import {environment} from '../../../environments/environment';
import {MapConfigurationState, reducer as mapConfigurationReducer} from './map/reducers/map-configuration.reducer';
import {LegendState, reducer as legendReducer} from './map/reducers/legend.reducer';

export interface State {
  mapConfiguration: MapConfigurationState;
  legend: LegendState;
}

export const reducers: ActionReducerMap<State> = {
  mapConfiguration: mapConfigurationReducer,
  legend: legendReducer
};

export const metaReducers: MetaReducer<State>[] = !environment.production ? [] : [];
