import {MapAuthStatusEffects} from '../auth/effects/map-auth-status.effects';
import {MapSearchEffects} from './effects/map-search.effects';
import {ActiveMapItemEffects} from './effects/active-map-item.effects';
import {DataDownloadOrderEffects} from './effects/data-download-order.effects';
import {DataDownloadProductEffects} from './effects/data-download-product.effects';
import {FeatureInfoEffects} from './effects/feature-info.effects';
import {OerebExtractEffects} from './effects/oereb-extract.effects';
import {LayerCatalogEffects} from './effects/layer-catalog.effects';
import {LegendEffects} from './effects/legend.effects';
import {MapConfigEffects} from './effects/map-config.effects';
import {FavouriteListEffects} from './effects/favourite-list.effects';
import {GeolocationEffects} from './effects/geolocation.effects';
import {GeneralInfoEffects} from './effects/general-info.effects';
import {PrintEffects} from './effects/print.effects';
import {MapUiEffects} from './effects/map-ui.effects';
import {ShareLinkEffects} from './effects/share-link.effects';
import {ToolEffects} from './effects/tool.effects';
import {StatisticsEffects} from './effects/statistics.effects';
import {DrawingEffects} from './effects/drawing.effects';
import {MapAttributeFiltersItemEffects} from './effects/map-attribute-filters-item.effects';
import {OverlayPrintEffects} from './effects/overlay-print.effects';
import {DataDownloadRegionEffects} from './effects/data-download-region.effects';
import {ElevationProfileEffects} from './effects/elevation-profile.effects';
import {DataDownloadOrderStatusJobEffects} from './effects/data-download-order-status-job.effects';
import {MapImportEffects} from './effects/map-import.effects';
import {ExternalMapItemEffects} from './effects/external-map-item.effects';
import {ExportEffects} from './effects/export.effects';
import {ImportEffects} from './effects/import.effects';

export const MAP_EFFECTS = [
  MapAuthStatusEffects,
  MapSearchEffects,
  ActiveMapItemEffects,
  FeatureInfoEffects,
  OerebExtractEffects,
  LayerCatalogEffects,
  LegendEffects,
  MapConfigEffects,
  FavouriteListEffects,
  GeolocationEffects,
  GeneralInfoEffects,
  PrintEffects,
  MapUiEffects,
  ShareLinkEffects,
  ToolEffects,
  StatisticsEffects,
  DrawingEffects,
  DataDownloadOrderEffects,
  DataDownloadOrderStatusJobEffects,
  DataDownloadProductEffects,
  MapAttributeFiltersItemEffects,
  OverlayPrintEffects,
  DataDownloadRegionEffects,
  ElevationProfileEffects,
  MapImportEffects,
  ExternalMapItemEffects,
  ExportEffects,
  ImportEffects,
];
