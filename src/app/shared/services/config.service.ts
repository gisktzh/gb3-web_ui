import {DOCUMENT} from '@angular/common';
import {Inject, Injectable} from '@angular/core';
import {defaultBasemap, defaultBasemaps} from '../configs/base-map.config';
import {dataCatalogueFilterConfig, dataDownloadFilterConfig} from '../configs/filter.config';
import {mapAnimationConfig} from '../configs/map-animation.config';
import {defaultMapConfig} from '../configs/map.config';
import {printConfig} from '../configs/print.config';
import {defaultRuntimeConfig} from '../configs/runtime.config';
import {searchIndexConfig, SearchIndexType} from '../configs/search-index.config';
import {searchConfig} from '../configs/search.config';
import {layerSymbolizations} from '../configs/symbolization.config';
import {toolTipMapToolsAndControls} from '../configs/tooltip.config';
import {EmbeddedMapConstants} from '../constants/embedded-map.constants';
import {Gb2Constants} from '../constants/gb2.constants';
import {MapConstants} from '../constants/map.constants';
import {HostNameResolutionMismatch} from '../errors/app.errors';
import {MapAnimationConfig} from '../interfaces/map-animation-config.interface';
import {PrintConfig} from '../interfaces/print-config.interface';
import {ApiConfig, AuthSettings, OverrideSettings, RuntimeConfig} from '../interfaces/runtime-config.interface';
import {SearchConfig} from '../interfaces/search-config.interface';
import {SearchIndex} from './apis/search/interfaces/search-index.interface';
import {pageConfig} from '../configs/page.config';
import {PageConfig} from '../interfaces/page-config.interface';
import {FilterConfig} from '../interfaces/filter-config.interface';

@Injectable({
  providedIn: 'root',
})
export class ConfigService {
  public readonly basemapConfig = {
    availableBasemaps: defaultBasemaps,
    defaultBasemap: defaultBasemap,
  };
  public readonly layerSymbolizations = layerSymbolizations;
  public readonly gb2Config = {
    wmsFormatMimeType: Gb2Constants.WMS_IMAGE_FORMAT_MIME_TYPE,
  };
  public readonly mapConfig = {
    internalLayerPrefix: MapConstants.INTERNAL_LAYER_PREFIX,
    userDrawingLayerPrefix: MapConstants.USER_DRAWING_LAYER_PREFIX,
    locateMeZoom: MapConstants.LOCATE_ME_ZOOM,
    defaultMapConfig: defaultMapConfig,
    mapScaleConfig: {
      maxScale: MapConstants.MAXIMUM_MAP_SCALE,
      minScale: MapConstants.MINIMUM_MAP_SCALE,
    },
  };
  public readonly apiConfig: ApiConfig;
  public readonly overridesConfig: OverrideSettings;
  public readonly authConfig: AuthSettings;
  public readonly embeddedMapConfig = {
    title: EmbeddedMapConstants.DEFAULT_TITLE,
    width: EmbeddedMapConstants.DEFAULT_WIDTH,
    height: EmbeddedMapConstants.DEFAULT_HEIGHT,
    borderSize: EmbeddedMapConstants.DEFAULT_BORDER_SIZE,
  };

  public readonly tooltipConfig = {
    mapToolsAndControls: toolTipMapToolsAndControls,
  };

  public get filterConfig(): FilterConfig {
    return {
      dataCatalogue: dataCatalogueFilterConfig,
      dataDownload: dataDownloadFilterConfig,
    };
  }
  public get searchConfig(): SearchConfig {
    return searchConfig;
  }
  public get searchIndexConfig(): SearchIndex[] {
    return searchIndexConfig;
  }

  public get printConfig(): PrintConfig {
    return printConfig;
  }

  public get mapAnimationConfig(): MapAnimationConfig {
    return mapAnimationConfig;
  }

  public get pageConfig(): PageConfig {
    return pageConfig;
  }

  constructor(@Inject(DOCUMENT) private readonly document: Document) {
    const runtimeConfig = this.findRuntimeConfig();
    if (!runtimeConfig) {
      throw new HostNameResolutionMismatch(); // note: this will actually prevent the app from loading in general
    }

    this.apiConfig = runtimeConfig.apiBasePaths;
    this.overridesConfig = runtimeConfig.overrides;
    this.authConfig = runtimeConfig.authSettings;
  }

  /**
   * Filters the search indexes from the config using the given search index types.
   * @param searchIndexTypes Only search indexes with this type will be returned
   */
  public filterSearchIndexes(searchIndexTypes: SearchIndexType[]): SearchIndex[] {
    return this.searchIndexConfig.filter((searchIndex) => searchIndexTypes.includes(searchIndex.indexType));
  }

  /**
   * Extracts the hostname from Document.location, also removing any port mappings.
   *
   * Then, tries to find a matching runtime configuration or returns undefined.
   */
  private findRuntimeConfig(): RuntimeConfig | undefined {
    const hostName = this.document.location.host.split(':')[0];
    return defaultRuntimeConfig.find((config) => config.hostMatch === hostName);
  }
}
