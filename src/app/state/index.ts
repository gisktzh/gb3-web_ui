import {ActionReducerMap, MetaReducer} from '@ngrx/store';
import {environment} from '../../environments/environment';
import {reducer as mapConfigReducer} from './map/reducers/map-config.reducer';
import {reducer as legendReducer} from './map/reducers/legend.reducer';
import {reducer as featureInfoReducer} from './map/reducers/feature-info.reducer';
import {reducer as layerCatalogReducer} from './map/reducers/layer-catalog.reducer';
import {reducer as activeMapItemReducer} from './map/reducers/active-map-item.reducer';
import {reducer as authStatusReducer} from './auth/reducers/auth-status.reducer';
import {reducer as favouriteListReducer} from './map/reducers/favourite-list.reducer';
import {reducer as supportContentReducer} from './support/reducers/support-content.reducer';
import {reducer as mapAttributeFiltersItemReducer} from './map/reducers/map-attribute-filters-item.reducer';
import {reducer as pageNotificationReducer} from './app/reducers/page-notification.reducer';
import {reducer as geolocationReducer} from './map/reducers/geolocation.reducer';
import {reducer as generalInfoReducer} from './map/reducers/general-info.reducer';
import {reducer as appLayoutReducer} from './app/reducers/app-layout.reducer';
import {ActiveMapItemState} from './map/states/active-map-item.state';
import {FavouriteListState} from './map/states/favourite-list.state';
import {FeatureInfoState} from './map/states/feature-info.state';
import {LayerCatalogState} from './map/states/layer-catalog.state';
import {LegendState} from './map/states/legend.state';
import {MapAttributeFiltersItemState} from './map/states/map-attribute-filters-item.state';
import {MapConfigState} from './map/states/map-config.state';
import {SupportContentState} from './support/states/support-content.state';
import {AuthStatusState} from './auth/states/auth-status.state';
import {PageNotificationState} from './app/states/page-notification.state';
import {GeolocationState} from './map/states/geolocation.state';
import {GeneralInfoState} from './map/states/general-info.state';
import {AppLayoutState} from './app/states/app-layout.state';

export interface State {
  mapConfig: MapConfigState;
  legend: LegendState;
  featureInfo: FeatureInfoState;
  layerCatalog: LayerCatalogState;
  activeMapItem: ActiveMapItemState;
  authStatus: AuthStatusState;
  favouriteList: FavouriteListState;
  supportContent: SupportContentState;
  mapAttributeFiltersItem: MapAttributeFiltersItemState;
  pageNotification: PageNotificationState;
  geolocation: GeolocationState;
  generalInfo: GeneralInfoState;
  appLayout: AppLayoutState;
}

export const reducers: ActionReducerMap<State> = {
  mapConfig: mapConfigReducer,
  legend: legendReducer,
  featureInfo: featureInfoReducer,
  layerCatalog: layerCatalogReducer,
  activeMapItem: activeMapItemReducer,
  authStatus: authStatusReducer,
  favouriteList: favouriteListReducer,
  supportContent: supportContentReducer,
  mapAttributeFiltersItem: mapAttributeFiltersItemReducer,
  pageNotification: pageNotificationReducer,
  geolocation: geolocationReducer,
  generalInfo: generalInfoReducer,
  appLayout: appLayoutReducer
};

export const metaReducers: MetaReducer<State>[] = !environment.production ? [] : [];
