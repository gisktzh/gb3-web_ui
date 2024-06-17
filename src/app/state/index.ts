import {ActionReducerMap, MetaReducer} from '@ngrx/store';
import {reducer as mapConfigReducer} from './map/reducers/map-config.reducer';
import {reducer as legendReducer} from './map/reducers/legend.reducer';
import {reducer as featureInfoReducer} from './map/reducers/feature-info.reducer';
import {reducer as layerCatalogReducer} from './map/reducers/layer-catalog.reducer';
import {reducer as activeMapItemReducer} from './map/reducers/active-map-item.reducer';
import {reducer as dataDownloadOrderReducer} from './map/reducers/data-download-order.reducer';
import {reducer as dataDownloadOrderStatusJobReducer} from './map/reducers/data-download-order-status-job.reducer';
import {reducer as dataDownloadProductReducer} from './map/reducers/data-download-product.reducer';
import {reducer as authStatusReducer} from './auth/reducers/auth-status.reducer';
import {reducer as favouriteListReducer} from './map/reducers/favourite-list.reducer';
import {reducer as supportContentReducer} from './support/reducers/support-content.reducer';
import {reducer as mapAttributeFiltersItemReducer} from './map/reducers/map-attribute-filters-item.reducer';
import {reducer as pageNotificationReducer} from './app/reducers/page-notification.reducer';
import {reducer as geolocationReducer} from './map/reducers/geolocation.reducer';
import {reducer as generalInfoReducer} from './map/reducers/general-info.reducer';
import {reducer as toolReducer} from './map/reducers/tool.reducer';
import {reducer as appLayoutReducer} from './app/reducers/app-layout.reducer';
import {reducer as printReducer} from './map/reducers/print.reducer';
import {reducer as exportReducer} from './map/reducers/export.reducer';
import {reducer as mapUiReducer} from './map/reducers/map-ui.reducer';
import {reducer as shareLinkReducer} from './map/reducers/share-link.reducer';
import {reducer as dataCatalogueReducer} from './data-catalogue/reducers/data-catalogue.reducer';
import {reducer as searchReducer} from './app/reducers/search.reducer';
import {reducer as drawingReducer} from './map/reducers/drawing.reducer';
import {reducer as urlReducer} from './app/reducers/url.reducer';
import {reducer as overlayPrintReducer} from './map/reducers/overlay-print.reducer';
import {reducer as dataDownloadRegionReducer} from './map/reducers/data-download-region.reducer';
import {reducer as elevationProfileReducer} from './map/reducers/elevation-profile.reducer';
import {reducer as drawingStyleReducer} from './map/reducers/drawing-style.reducer';
import {reducer as mapImportReducer} from './map/reducers/map-import.reducer';
import {reducer as externalMapItemReducer} from './map/reducers/external-map-item.reducer';
import {reducer as appReducer} from './app/reducers/app.reducer';
import {reducer as importReducer} from './map/reducers/import.reducer';
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
import {DataDownloadOrderState} from './map/states/data-download-order.state';
import {DataDownloadProductState} from './map/states/data-download-product.state';
import {PrintState} from './map/states/print.state';
import {MapUiState} from './map/states/map-ui.state';
import {ToolState} from './map/states/tool.state';
import {ShareLinkState} from './map/states/share-link.state';
import {ActiveMapItemEffects} from './map/effects/active-map-item.effects';
import {DataDownloadOrderEffects} from './map/effects/data-download-order.effects';
import {DataDownloadProductEffects} from './map/effects/data-download-product.effects';
import {FeatureInfoEffects} from './map/effects/feature-info.effects';
import {LayerCatalogEffects} from './map/effects/layer-catalog.effects';
import {LegendEffects} from './map/effects/legend.effects';
import {MapConfigEffects} from './map/effects/map-config.effects';
import {AuthStatusEffects} from './auth/effects/auth-status.effects';
import {FavouriteListEffects} from './map/effects/favourite-list.effects';
import {PageNotificationEffects} from './app/effects/page-notification.effects';
import {GeolocationEffects} from './map/effects/geolocation.effects';
import {GeneralInfoEffects} from './map/effects/general-info.effects';
import {PrintEffects} from './map/effects/print.effects';
import {MapUiEffects} from './map/effects/map-ui.effects';
import {ShareLinkEffects} from './map/effects/share-link.effects';
import {ToolEffects} from './map/effects/tool.effects';
import {DataCatalogueState} from './data-catalogue/states/data-catalogue.state';
import {DataCatalogueEffects} from './data-catalogue/effects/data-catalogue.effects';
import {SearchState} from './app/states/search.state';
import {SearchEffects} from './app/effects/search.effects';
import {DrawingState} from './map/states/drawing.state';
import {DrawingEffects} from './map/effects/drawing.effects';
import {AppLayoutEffects} from './app/effects/app-layout.effects';
import {MapAttributeFiltersItemEffects} from './map/effects/map-attribute-filters-item.effects';
import {routerReducer, RouterState} from '@ngrx/router-store';
import {UrlState} from './app/states/url.state';
import {UrlEffects} from './app/effects/url.effects';
import {OverlayPrintState} from './map/states/overlay-print.state';
import {OverlayPrintEffects} from './map/effects/overlay-print.effects';
import {DataDownloadRegionState} from './map/states/data-download-region.state';
import {DataDownloadRegionEffects} from './map/effects/data-download-region.effects';
import {ElevationProfileState} from './map/states/elevation-profile.state';
import {ElevationProfileEffects} from './map/effects/elevation-profile.effects';
import {DrawingStyleState} from './map/states/drawing-style.state';
import {DataDownloadOrderStatusJobEffects} from './map/effects/data-download-order-status-job.effects';
import {DataDownloadOrderStatusJobState} from './map/states/data-download-order-status-job.state';
import {MapImportState} from './map/states/map-import.state';
import {MapImportEffects} from './map/effects/map-import.effects';
import {ExternalMapItemState} from './map/states/external-map-item.state';
import {ExternalMapItemEffects} from './map/effects/external-map-item.effects';
import {AppState} from './app/states/app.state';
import {AppEffects} from './app/effects/app.effects';
import {ExportEffects} from './map/effects/export.effects';
import {ExportState} from './map/states/export.state';
import {ImportEffects} from './map/effects/import.effects';
import {ImportState} from './map/states/impor.state';

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
  dataDownloadOrder: DataDownloadOrderState;
  dataDownloadOrderStatusJob: DataDownloadOrderStatusJobState;
  dataDownloadProduct: DataDownloadProductState;
  router: RouterState;
  url: UrlState;
  overlayPrint: OverlayPrintState;
  dataDownloadRegion: DataDownloadRegionState;
  elevationProfile: ElevationProfileState;
  drawingStyle: DrawingStyleState;
  mapImport: MapImportState;
  externalMapItem: ExternalMapItemState;
  app: AppState;
  export: ExportState;
  drawingsImport: ImportState;
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
  dataDownloadOrder: dataDownloadOrderReducer,
  dataDownloadOrderStatusJob: dataDownloadOrderStatusJobReducer,
  dataDownloadProduct: dataDownloadProductReducer,
  router: routerReducer,
  url: urlReducer,
  overlayPrint: overlayPrintReducer,
  dataDownloadRegion: dataDownloadRegionReducer,
  elevationProfile: elevationProfileReducer,
  drawingStyle: drawingStyleReducer,
  mapImport: mapImportReducer,
  externalMapItem: externalMapItemReducer,
  app: appReducer,
  export: exportReducer,
  drawingsImport: importReducer,
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
  DataDownloadOrderEffects,
  DataDownloadOrderStatusJobEffects,
  DataDownloadProductEffects,
  AppLayoutEffects,
  MapAttributeFiltersItemEffects,
  UrlEffects,
  OverlayPrintEffects,
  DataDownloadRegionEffects,
  ElevationProfileEffects,
  MapImportEffects,
  ExternalMapItemEffects,
  ExportEffects,
  ImportEffects,
  AppEffects,
];

export const metaReducers: MetaReducer<State>[] = [];
