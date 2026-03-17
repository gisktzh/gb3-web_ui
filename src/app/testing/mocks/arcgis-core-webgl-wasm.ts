/* eslint-disable @typescript-eslint/naming-convention */

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
