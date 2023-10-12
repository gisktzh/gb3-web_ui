import {ActionReducerMap, MetaReducer} from '@ngrx/store';
import {AppLayoutEffects} from './app/effects/app-layout.effects';
import {PageNotificationEffects} from './app/effects/page-notification.effects';
import {SearchEffects} from './app/effects/search.effects';
import {reducer as appLayoutReducer} from './app/reducers/app-layout.reducer';
import {reducer as pageNotificationReducer} from './app/reducers/page-notification.reducer';
import {reducer as searchReducer} from './app/reducers/search.reducer';
import {AppLayoutState} from './app/states/app-layout.state';
import {PageNotificationState} from './app/states/page-notification.state';
import {SearchState} from './app/states/search.state';
import {AuthStatusEffects} from './auth/effects/auth-status.effects';
import {reducer as authStatusReducer} from './auth/reducers/auth-status.reducer';
import {AuthStatusState} from './auth/states/auth-status.state';
import {DataCatalogueEffects} from './data-catalogue/effects/data-catalogue.effects';
import {reducer as dataCatalogueReducer} from './data-catalogue/reducers/data-catalogue.reducer';
import {DataCatalogueState} from './data-catalogue/states/data-catalogue.state';
import {ActiveMapItemEffects} from './map/effects/active-map-item.effects';
import {DataDownloadEffects} from './map/effects/data-download.effects';
import {DrawingEffects} from './map/effects/drawing.effects';
import {FavouriteListEffects} from './map/effects/favourite-list.effects';
import {FeatureInfoEffects} from './map/effects/feature-info.effects';
import {GeneralInfoEffects} from './map/effects/general-info.effects';
import {GeolocationEffects} from './map/effects/geolocation.effects';
import {LayerCatalogEffects} from './map/effects/layer-catalog.effects';
import {LegendEffects} from './map/effects/legend.effects';
import {MapAttributeFiltersItemEffects} from './map/effects/map-attribute-filters-item.effects';
import {MapConfigEffects} from './map/effects/map-config-effects.service';
import {MapUiEffects} from './map/effects/map-ui.effects';
import {PrintEffects} from './map/effects/print.effects';
import {ShareLinkEffects} from './map/effects/share-link.effects';
import {ToolEffects} from './map/effects/tool.effects';
import {reducer as activeMapItemReducer} from './map/reducers/active-map-item.reducer';
import {reducer as dataDownloadReducer} from './map/reducers/data-download.reducer';
import {reducer as drawingReducer} from './map/reducers/drawing.reducer';
import {reducer as favouriteListReducer} from './map/reducers/favourite-list.reducer';
import {reducer as featureInfoReducer} from './map/reducers/feature-info.reducer';
import {reducer as generalInfoReducer} from './map/reducers/general-info.reducer';
import {reducer as geolocationReducer} from './map/reducers/geolocation.reducer';
import {reducer as layerCatalogReducer} from './map/reducers/layer-catalog.reducer';
import {reducer as legendReducer} from './map/reducers/legend.reducer';
import {reducer as mapAttributeFiltersItemReducer} from './map/reducers/map-attribute-filters-item.reducer';
import {reducer as mapConfigReducer} from './map/reducers/map-config.reducer';
import {reducer as mapUiReducer} from './map/reducers/map-ui.reducer';
import {reducer as printReducer} from './map/reducers/print.reducer';
import {reducer as shareLinkReducer} from './map/reducers/share-link.reducer';
import {reducer as toolReducer} from './map/reducers/tool.reducer';
import {ActiveMapItemState} from './map/states/active-map-item.state';
import {DataDownloadState} from './map/states/data-download.state';
import {DrawingState} from './map/states/drawing.state';
import {FavouriteListState} from './map/states/favourite-list.state';
import {FeatureInfoState} from './map/states/feature-info.state';
import {GeneralInfoState} from './map/states/general-info.state';
import {GeolocationState} from './map/states/geolocation.state';
import {LayerCatalogState} from './map/states/layer-catalog.state';
import {LegendState} from './map/states/legend.state';
import {MapAttributeFiltersItemState} from './map/states/map-attribute-filters-item.state';
import {MapConfigState} from './map/states/map-config.state';
import {MapUiState} from './map/states/map-ui.state';
import {PrintState} from './map/states/print.state';
import {ShareLinkState} from './map/states/share-link.state';
import {ToolState} from './map/states/tool.state';
import {reducer as supportContentReducer} from './support/reducers/support-content.reducer';
import {SupportContentState} from './support/states/support-content.state';

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
  print: PrintState;
  mapUi: MapUiState;
  tool: ToolState;
  shareLink: ShareLinkState;
  dataCatalogue: DataCatalogueState;
  search: SearchState;
  drawing: DrawingState;
  dataDownload: DataDownloadState;
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
  appLayout: appLayoutReducer,
  print: printReducer,
  mapUi: mapUiReducer,
  tool: toolReducer,
  shareLink: shareLinkReducer,
  dataCatalogue: dataCatalogueReducer,
  search: searchReducer,
  drawing: drawingReducer,
  dataDownload: dataDownloadReducer,
};

export const effects = [
  ActiveMapItemEffects,
  FeatureInfoEffects,
  LayerCatalogEffects,
  LegendEffects,
  MapConfigEffects,
  AuthStatusEffects,
  FavouriteListEffects,
  PageNotificationEffects,
  GeolocationEffects,
  GeneralInfoEffects,
  PrintEffects,
  MapUiEffects,
  ShareLinkEffects,
  ToolEffects,
  DataCatalogueEffects,
  SearchEffects,
  DrawingEffects,
  DataDownloadEffects,
  AppLayoutEffects,
  MapAttributeFiltersItemEffects,
];

export const metaReducers: MetaReducer<State>[] = [];
