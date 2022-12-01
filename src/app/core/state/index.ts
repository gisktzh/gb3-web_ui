import {ActionReducerMap, MetaReducer} from '@ngrx/store';
import {environment} from '../../../environments/environment';
import {MapConfigurationState, reducer as mapConfigurationReducer} from './map/reducers/map-configuration.reducer';
import {LegendState, reducer as legendReducer} from './map/reducers/legend.reducer';
import {LayerCatalogState, reducer as layerCatalogReducer} from './map/reducers/layer-catalog.reducer';

export interface State {
  mapConfiguration: MapConfigurationState;
  legend: LegendState;
  layerCatalog: LayerCatalogState;
}

export const reducers: ActionReducerMap<State> = {
  mapConfiguration: mapConfigurationReducer,
  legend: legendReducer,
  layerCatalog: layerCatalogReducer
};

export const metaReducers: MetaReducer<State>[] = !environment.production ? [] : [];
