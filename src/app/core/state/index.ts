import {ActionReducerMap, MetaReducer} from '@ngrx/store';
import {environment} from '../../../environments/environment';
import {MapConfigurationState, reducer as mapConfigurationReducer} from './map/reducers/map-configuration.reducer';
import {LegendState, reducer as legendReducer} from './map/reducers/legend.reducer';
import {InfoQueryState, reducer as infoQueryReducer} from './map/reducers/info-query.reducer';

export interface State {
  mapConfiguration: MapConfigurationState;
  legend: LegendState;
  infoQuery: InfoQueryState;
}

export const reducers: ActionReducerMap<State> = {
  mapConfiguration: mapConfigurationReducer,
  legend: legendReducer,
  infoQuery: infoQueryReducer
};

export const metaReducers: MetaReducer<State>[] = !environment.production ? [] : [];
