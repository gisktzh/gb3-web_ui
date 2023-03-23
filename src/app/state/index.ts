import {ActionReducerMap, MetaReducer} from '@ngrx/store';
import {environment} from '../../environments/environment';
import {MapConfigState, reducer as mapConfigReducer} from './map/reducers/map-config.reducer';
import {LegendState, reducer as legendReducer} from './map/reducers/legend.reducer';
import {FeatureInfoState, reducer as featureInfoReducer} from './map/reducers/feature-info.reducer';
import {LayerCatalogState, reducer as layerCatalogReducer} from './map/reducers/layer-catalog.reducer';
import {ActiveMapItemState, reducer as activeMapItemReducer} from './map/reducers/active-map-item.reducer';
import {AuthStatusState, reducer as authStatusReducer} from './auth/reducers/auth-status.reducer';
import {FavouriteListState, reducer as favouriteListReducer} from './map/reducers/favourite-list.reducer';

export interface State {
  mapConfig: MapConfigState;
  legend: LegendState;
  featureInfo: FeatureInfoState;
  layerCatalog: LayerCatalogState;
  activeMapItem: ActiveMapItemState;
  authStatus: AuthStatusState;
  favouriteList: FavouriteListState;
}

export const reducers: ActionReducerMap<State> = {
  mapConfig: mapConfigReducer,
  legend: legendReducer,
  featureInfo: featureInfoReducer,
  layerCatalog: layerCatalogReducer,
  activeMapItem: activeMapItemReducer,
  authStatus: authStatusReducer,
  favouriteList: favouriteListReducer
};

export const metaReducers: MetaReducer<State>[] = !environment.production ? [] : [];
