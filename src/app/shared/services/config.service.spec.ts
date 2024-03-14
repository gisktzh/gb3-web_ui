import {TestBed} from '@angular/core/testing';
import {ConfigService} from './config.service';
import {MockStore, provideMockStore} from '@ngrx/store/testing';
import {DOCUMENT} from '@angular/common';
import {InjectionToken, Provider} from '@angular/core';
import {HostNameResolutionMismatch} from '../errors/app.errors';
import {defaultRuntimeConfig} from '../configs/runtime.testing.config';
import {defaultFeatureFlags} from '../configs/feature-flags.config';
import {layerSymbolizations} from '../configs/symbolization.config';
import {Gb2Constants} from '../constants/gb2.constants';
import {MapConstants} from '../constants/map.constants';
import {defaultMapConfig} from '../configs/map.config';
import {EmbeddedMapConstants} from '../constants/embedded-map.constants';
import {RuntimeConfig} from '../interfaces/runtime-config.interface';
import {toolTipMapToolsAndControls} from '../configs/tooltip.config';
import {defaultFillColor, defaultLineColor, defaultLineWidth, defaultOutline} from '../configs/drawing.config';
import {dataCatalogueFilterConfig, dataDownloadFilterConfig} from '../configs/filter.config';
import {searchConfig} from '../configs/search.config';
import {searchIndexConfig, SearchIndexType} from '../configs/search-index.config';
import {printConfig} from '../configs/print.config';
import {pageConfig} from '../configs/page.config';
import {mapAnimationConfig} from '../configs/map-animation.config';
import {dataDownloadConfig} from '../configs/data-download.config';
import {AppActions} from '../../state/app/actions/app.actions';

interface ConfigServiceKey {
  serviceKey: keyof ConfigService;
}
interface RuntimeConfigTest extends ConfigServiceKey {
  runtimeConfigKey: keyof RuntimeConfig;
}
interface ValueConfigTest extends ConfigServiceKey {
  expected: object;
}
const documentFactory = (host: string) => ({location: {host}, querySelectorAll: () => []}) as unknown as Document;
const HOST_TOKEN = new InjectionToken<string>('host');
const testingHostProvider: Provider = {provide: HOST_TOKEN, useValue: 'localhost'};

describe('ConfigService', () => {
  let service: ConfigService;

  describe('initialization', () => {
    it('succeeds if a runtime configuration can be found', () => {
      TestBed.configureTestingModule({
        imports: [],
        providers: [provideMockStore(), testingHostProvider, {provide: DOCUMENT, useFactory: documentFactory, deps: [HOST_TOKEN]}],
      });

      service = TestBed.inject(ConfigService);

      expect(service).toBeTruthy();
    });

    it('throws HostNameResolutionMismatch if no runtime configuration is found', () => {
      TestBed.configureTestingModule({
        imports: [],
        providers: [
          provideMockStore(),
          {provide: HOST_TOKEN, useValue: 'this-does-not-exist'},
          {provide: DOCUMENT, useFactory: documentFactory, deps: [HOST_TOKEN]},
        ],
      });

      expect(() => TestBed.inject(ConfigService)).toThrowError(HostNameResolutionMismatch);
    });

    it('dispatches AppActions.setDynamicInternalUrlConfiguration with the correct values', () => {
      TestBed.configureTestingModule({
        imports: [],
        providers: [provideMockStore(), testingHostProvider, {provide: DOCUMENT, useFactory: documentFactory, deps: [HOST_TOKEN]}],
      });
      const store = TestBed.inject(MockStore);
      const setDynamicInternalUrlConfigurationSpy = spyOn(store, 'dispatch');
      service = TestBed.inject(ConfigService);

      const expectedDynamicInternalUrlsConfiguration = {
        geolion: {
          href: defaultRuntimeConfig[0].apiBasePaths.geoLion.baseUrl,
        },
      };

      expect(setDynamicInternalUrlConfigurationSpy).toHaveBeenCalledWith(
        jasmine.objectContaining({
          type: AppActions.setDynamicInternalUrlConfiguration.type,
          dynamicInternalUrlsConfiguration: expectedDynamicInternalUrlsConfiguration,
        }),
      );
    });
  });

  describe('logic', () => {
    beforeEach(() => {
      TestBed.configureTestingModule({
        imports: [],
        providers: [provideMockStore(), testingHostProvider, {provide: DOCUMENT, useFactory: documentFactory, deps: [HOST_TOKEN]}],
      });
      service = TestBed.inject(ConfigService);
    });

    it('should be created', () => {
      expect(service).toBeTruthy();
    });

    it('returns the correct filtered search indexes', () => {
      const searchIndexType: SearchIndexType = 'metadata-services';
      const result = service.filterSearchIndexes([searchIndexType]);

      expect(result).toHaveSize(1);
      expect(result[0].indexType).toEqual(searchIndexConfig.find((config) => (config.indexType = searchIndexType))!.indexType);
    });

    describe('configuration values', () => {
      it('merges default and runtime feature flags', () => {
        // we know this works because we set the testing runtime configuration to be the opposite of the default
        expect(service.featureFlags).toEqual(jasmine.objectContaining({oerebExtract: defaultRuntimeConfig[0].featureFlags.oerebExtract}));
        expect(service.featureFlags).toEqual(jasmine.objectContaining({ownershipInformation: defaultFeatureFlags.ownershipInformation}));
      });

      // test values which are dependent on the loaded runtime configuration
      const runtimeConfigTests: RuntimeConfigTest[] = [
        {serviceKey: 'apiConfig', runtimeConfigKey: 'apiBasePaths'},
        {serviceKey: 'authConfig', runtimeConfigKey: 'authSettings'},
        {serviceKey: 'overridesConfig', runtimeConfigKey: 'overrides'},
      ];
      runtimeConfigTests.forEach(({runtimeConfigKey, serviceKey}) => {
        it(`returns the runtimeconfig ${runtimeConfigKey}`, () => {
          expect(service[serviceKey]).toEqual(defaultRuntimeConfig[0][runtimeConfigKey]);
        });
      });

      // test values which are exporting static values
      const valueConfigTests: ValueConfigTest[] = [
        {serviceKey: 'filterConfigs', expected: {dataCatalogue: dataCatalogueFilterConfig, dataDownload: dataDownloadFilterConfig}},
        {serviceKey: 'searchConfig', expected: searchConfig},
        {serviceKey: 'searchIndexConfig', expected: searchIndexConfig},
        {serviceKey: 'printConfig', expected: printConfig},
        {serviceKey: 'pageConfig', expected: pageConfig},
        {serviceKey: 'mapAnimationConfig', expected: mapAnimationConfig},
        {serviceKey: 'dataDownloadConfig', expected: dataDownloadConfig},
        {serviceKey: 'layerSymbolizations', expected: layerSymbolizations},
        {
          serviceKey: 'tooltipConfig',
          expected: {
            mapToolsAndControls: toolTipMapToolsAndControls,
          },
        },
        {
          serviceKey: 'drawingConfig',
          expected: {
            defaultLineColor: defaultLineColor,
            defaultFillColor: defaultFillColor,
            defaultLineWidth: defaultLineWidth,
            defaultOutline: defaultOutline,
          },
        },
        {serviceKey: 'gb2Config', expected: {wmsFormatMimeType: Gb2Constants.WMS_IMAGE_FORMAT_MIME_TYPE}},
        {
          serviceKey: 'mapConfig',
          expected: {
            internalLayerPrefix: MapConstants.INTERNAL_LAYER_PREFIX,
            userDrawingLayerPrefix: MapConstants.USER_DRAWING_LAYER_PREFIX,
            locateMeZoom: MapConstants.LOCATE_ME_ZOOM,
            defaultMapConfig: defaultMapConfig,
            mapScaleConfig: {
              maxScale: MapConstants.MAXIMUM_MAP_SCALE,
              minScale: MapConstants.MINIMUM_MAP_SCALE,
            },
          },
        },
        {
          serviceKey: 'embeddedMapConfig',
          expected: {
            title: EmbeddedMapConstants.DEFAULT_TITLE,
            width: EmbeddedMapConstants.DEFAULT_WIDTH,
            height: EmbeddedMapConstants.DEFAULT_HEIGHT,
            borderSize: EmbeddedMapConstants.DEFAULT_BORDER_SIZE,
          },
        },
      ];
      valueConfigTests.forEach(({serviceKey, expected}) => {
        it(`returns the expected value for ${serviceKey}`, () => {
          expect(service[serviceKey]).toEqual(expected);
        });
      });
    });
  });
});
