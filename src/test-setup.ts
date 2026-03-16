/* eslint-disable @typescript-eslint/naming-convention */
import esriConfig from '@arcgis/core/config';
esriConfig.assetsPath = '.';

import {getTestBed} from '@angular/core/testing';
import {BrowserTestingModule, platformBrowserTesting} from '@angular/platform-browser/testing';
import './app/testing/matchers/drawing-symbol-descriptor.matcher';

const testBed = getTestBed();

if (!testBed.platform) {
  // Initialize the Angular testing environment
  getTestBed().initTestEnvironment(BrowserTestingModule, platformBrowserTesting());
}

// The following mocks are necessary for @arcgis/core to _think_ that WebGL is running.
// We basically mock all the WASM dependencies and tell @arcgis/core that WebGL2 is
// supported by not throwing errors.

vi.mock('@arcgis/core/views/support/WebGLRequirements.js', () => ({
  checkWebGLRequirements: () => null, // I was just as surprised as the next dev when I found out that "null" means "yes" in this context.
}));

vi.mock('@arcgis/core/chunks/pe-wasm.js', () => ({
  default: () =>
    Promise.resolve(
      Promise.resolve({
        _pe_getPeGTlistExtendedEntrySize: () => 42,
        PeGTlistExtended: {
          prototype: {},
        },
        PeNotationMgrs: {
          prototype: {},
        },
        PeNotationUtm: {
          prototype: {},
        },
        PePCSInfo: {
          prototype: {},
        },
        PeVersion: {
          prototype: {},
        },
        PeProjcs: {
          prototype: {},
        },
        PeObject: {
          prototype: {},
        },
        PeAngunit: {
          prototype: {},
        },
        PeDatum: {
          prototype: {},
        },
        PeGeogcs: {
          prototype: {},
        },
        PeGeogtran: {
          prototype: {},
        },
        PeParameter: {
          prototype: {},
        },
        PePrimem: {
          prototype: {},
        },
        PeSpheroid: {
          prototype: {},
        },
        PeUnit: {
          prototype: {},
        },
        PeHorizon: {
          prototype: {},
        },
        PeGTlistExtendedEntry: {
          prototype: {},
        },
        PeFactory: {
          prototype: {
            initialize: vi.fn(),
          },
        },
        _pe_getPeGTlistExtendedGTsSize: vi.fn(),
        _pe_getPeHorizonSize: vi.fn(),
        PeDouble: class {},
        PeGCSExtent: class {},
        PeDefs: {
          prototype: {
            PE_BUFFER_MAX: null,
            PE_NAME_MAX: null,
            PE_MGRS_MAX: null,
            PE_USNG_MAX: null,
            PE_DD_MAX: null,
            PE_DDM_MAX: null,
            PE_DMS_MAX: null,
            PE_UTM_MAX: null,
            PE_PARM_MAX: null,
            PE_TYPE_NONE: null,
            PE_TYPE_GEOGCS: null,
            PE_TYPE_PROJCS: null,
            PE_TYPE_GEOGTRAN: null,
            PE_TYPE_COORDSYS: null,
            PE_TYPE_UNIT: null,
            PE_TYPE_LINUNIT: null,
            PE_STR_OPTS_NONE: null,
            PE_STR_AUTH_NONE: null,
            PE_STR_AUTH_TOP: null,
            PE_STR_NAME_CANON: null,
            PE_STR_FMT_WKT: null,
            PE_PARM_X: null,
            PE_PARM_ND: null,
            PE_TRANSFORM_1_TO_2: null,
            PE_TRANSFORM_2_TO_1: null,
            PE_TRANSFORM_P_TO_G: null,
            PE_TRANSFORM_G_TO_P: null,
            PE_HORIZON_RECT: null,
            PE_HORIZON_POLY: null,
            PE_HORIZON_LINE: null,
            PE_HORIZON_DELTA: null,
          },
        },
      }),
    ),
}));

vi.mock('@arcgis/core/symbols/support/cimSymbolUtils', () => ({
  applyCIMSymbolRotation: vi.fn(),
  scaleCIMSymbolTo: vi.fn(),
}));

vi.mock('@arcgis/core/views/MapView', () => ({
  default: vi.fn(
    class {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      [key: string]: any;

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      constructor(data: Record<string, any>) {
        Object.assign(this, data);
      }

      public removeHandles = vi.fn();
      public addHandles = vi.fn();
    },
  ),
}));

vi.mock('@gisktzh/cim-symbol-to-svg', () => ({
  default: vi.fn(),
}));

const mockResourceHandle = {
  remove: vi.fn(),
  on: vi.fn(),
};

vi.mock(import('@arcgis/core/core/reactiveUtils'), async (importOriginal) => {
  const original = await importOriginal();

  return {
    ...original,
    on: vi.fn().mockReturnValue(mockResourceHandle),
    watch: vi.fn().mockReturnValue(mockResourceHandle),
  };
});

class ResizeObserver {
  public observe = vi.fn();
  public unobserve = vi.fn();
  public disconnect = vi.fn();
}

vi.stubGlobal('ResizeObserver', ResizeObserver);

const MockStorage = {
  getItem: vi.fn(),
  removeItem: vi.fn(),
  setItem: vi.fn(),
  clear: vi.fn(),
};

vi.stubGlobal('sessionStorage', MockStorage);
vi.stubGlobal('localStorage', MockStorage);

class GeolocationPositionErrorMock {
  public readonly PERMISSION_DENIED = 1 as const;
  public readonly POSITION_UNAVAILABLE = 2 as const;
  public readonly TIMEOUT = 3 as const;
}

vi.stubGlobal('GeolocationPositionError', GeolocationPositionErrorMock);

vi.stubGlobal('console', {
  ...console,
  timeStamp: vi.fn(),
});
