import {ActionReducerMap, MetaReducer} from '@ngrx/store';
import {environment} from '../../../environments/environment';
import {MapConfigurationState, reducer as mapConfigurationReducer} from './map/reducers/map-configuration.reducer';

export interface State {
  mapConfiguration: MapConfigurationState;
}

export const reducers: ActionReducerMap<State> = {
  mapConfiguration: mapConfigurationReducer
};

export const metaReducers: MetaReducer<State>[] = !environment.production ? [] : [];
