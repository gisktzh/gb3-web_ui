import {ActionReducerMap, MetaReducer} from '@ngrx/store';
import {environment} from '../../../environments/environment';
import {MapConfigurationState, reducer as mapConfigurationReducer} from './map/reducers/map-configuration.reducer';
import {LegendState, reducer as legendReducer} from './map/reducers/legend.reducer';
import {FeatureInfoState, reducer as featureInfoReducer} from './map/reducers/feature-info.reducer';
import {LayerCatalogState, reducer as layerCatalogReducer} from './map/reducers/layer-catalog.reducer';
import {ActiveMapItemState, reducer as activeMapItemReducer} from './map/reducers/active-map-item.reducer';

export interface State {
  mapConfiguration: MapConfigurationState;
  legend: LegendState;
  featureInfo: FeatureInfoState;
  layerCatalog: LayerCatalogState;
  activeMapItem: ActiveMapItemState;
}

export const reducers: ActionReducerMap<State> = {
  mapConfiguration: mapConfigurationReducer,
  legend: legendReducer,
  featureInfo: featureInfoReducer,
  layerCatalog: layerCatalogReducer,
  activeMapItem: activeMapItemReducer
};

export const metaReducers: MetaReducer<State>[] = !environment.production ? [] : [];
