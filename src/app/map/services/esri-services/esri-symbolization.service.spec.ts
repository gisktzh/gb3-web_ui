import {TestBed} from '@angular/core/testing';

import {EsriSymbolizationService} from './esri-symbolization.service';
import {MinimalGeometriesUtils} from '../../../testing/map-testing/minimal-geometries.utils';
import {SupportedSrs} from '../../../shared/types/supported-srs.type';
import {InternalDrawingLayer, UserDrawingLayer} from '../../../shared/enums/drawing-layer.enum';
import SimpleLineSymbol from '@arcgis/core/symbols/SimpleLineSymbol';
import SimpleMarkerSymbol from '@arcgis/core/symbols/SimpleMarkerSymbol';
import SimpleFillSymbol from '@arcgis/core/symbols/SimpleFillSymbol';
import {GeometryCollectionWithSrs} from '../../../shared/interfaces/geojson-types-with-srs.interface';
import {ConfigService} from '../../../shared/services/config.service';
import {LayerSymbolizations, PicturePointSymbolization, SimplePointSymbolization} from '../../../shared/interfaces/symbolization.interface';
import PictureMarkerSymbol from '@arcgis/core/symbols/PictureMarkerSymbol';
import TextSymbol from '@arcgis/core/symbols/TextSymbol';
import {provideMockStore} from '@ngrx/store/testing';

const SRS: SupportedSrs = 2056;
const mockIconUrl = '/path/to/icon.svg';
const minimalTestSet = [
  {
    expected: 'SimpleLineSymbol',
    expectedInstanceOf: SimpleLineSymbol,
    geometry: MinimalGeometriesUtils.getMinimalLineString(SRS),
    type: 'LineString',
  },
  {
    expected: 'SimpleLineSymbol',
    expectedInstanceOf: SimpleLineSymbol,
    geometry: MinimalGeometriesUtils.getMinimalMultiLineString(SRS),
    type: 'MultiLineString',
  },
  {
    expected: 'SimpleMarkerSymbol',
    expectedInstanceOf: SimpleMarkerSymbol,
    geometry: MinimalGeometriesUtils.getMinimalPoint(SRS),
    type: 'Point',
  },
  {
    expected: 'SimpleMarkerSymbol',
    expectedInstanceOf: SimpleMarkerSymbol,
    geometry: MinimalGeometriesUtils.getMinimalMultiPoint(SRS),
    type: 'MultiPoint',
  },
  {
    expected: 'SimpleFillSymbol',
    expectedInstanceOf: SimpleFillSymbol,
    geometry: MinimalGeometriesUtils.getMinimalPolygon(SRS),
    type: 'Polygon',
  },
  {
    expected: 'SimpleFillSymbol',
    expectedInstanceOf: SimpleFillSymbol,
    geometry: MinimalGeometriesUtils.getMinimalMultiPolygon(SRS),
    type: 'MultiPolygon',
  },
];

// we only mock some of the values; because we mainly need to test different colors and point types.
const mockSymbolizations: LayerSymbolizations = {
  [UserDrawingLayer.Drawings]: {
    text: {
      color: {
        r: 255,
        g: 255,
        b: 0,
        a: 0.6,
      },
      outline: {
        width: 1232,
        color: {
          r: 22,
          g: 12,
          b: 99,
          a: 0.11,
        },
      },
      xOffset: 5,
      yOffset: 1,
      size: 9001,
    },
  },
  [InternalDrawingLayer.LocatePosition]: {
    point: {
      type: 'picture',
      width: 24,
      height: 45,
      url: mockIconUrl,
      yOffset: 12, // half of the image size to set needle at the actual point location
      xOffset: 0,
      angle: 0,
    },
  },
  [InternalDrawingLayer.FeatureHighlight]: {
    point: {
      type: 'simple',
      size: 12,
      color: {
        r: 255,
        g: 255,
        b: 0,
        a: 0.6,
      },
      outline: {
        width: 1232,
        color: {
          r: 22,
          g: 12,
          b: 99,
          a: 0.11,
        },
      },
    },
    line: {
      width: 5,
      color: {
        r: 255,
        g: 169,
        b: 0,
        a: 0.6,
      },
    },
    polygon: {
      fill: {
        color: {
          r: 255,
          g: 255,
          b: 0,
          a: 0.6,
        },
      },
      outline: {
        width: 5,
        color: {
          r: 164,
          g: 255,
          b: 0,
          a: 1.0,
        },
      },
    },
  },
} as LayerSymbolizations;

describe('EsriSymbolizationService', () => {
  let service: EsriSymbolizationService;

  beforeEach(() => {
    // simple mock by overriding a readonly property and then injecting it into the TestBed.
    let configService = new ConfigService(document);
    configService = Object.assign(configService, {layerSymbolizations: mockSymbolizations});
    TestBed.configureTestingModule({
      providers: [EsriSymbolizationService, {provide: ConfigService, useValue: configService}, provideMockStore()],
    });
    service = TestBed.inject(EsriSymbolizationService);
  });

  describe('geometry-dependent symbolization', () => {
    minimalTestSet.forEach(({expected, expectedInstanceOf, geometry, type}) => {
      it(`returns ${expected} for ${type}`, () => {
        const result = service.createSymbolizationForDrawingLayer(geometry, InternalDrawingLayer.FeatureHighlight);

        expect(result).toBeInstanceOf(expectedInstanceOf);
      });
    });

    it('throws for GeometryCollection', () => {
      const collection: GeometryCollectionWithSrs = {type: 'GeometryCollection', geometries: [], srs: SRS};

      expect(() => service.createSymbolizationForDrawingLayer(collection, InternalDrawingLayer.FeatureHighlight)).toThrow();
    });
  });

  describe('point symbol types', () => {
    it('returns a text symbol for features which are a Drawing and have a label, setting the supplied text', () => {
      const point = MinimalGeometriesUtils.getMinimalPoint(SRS);
      const testLayer = UserDrawingLayer.Drawings;
      const label = 'Legolas & Elrond';

      const result = service.createSymbolizationForDrawingLayer(point, testLayer, 'Legolas & Elrond') as TextSymbol;

      const expected = mockSymbolizations[testLayer].text;
      expect(result.text).toEqual(label);
      expect(result.color.toRgba()).toEqual([expected.color.r, expected.color.g, expected.color.b, expected.color.a]);
      expect(result.haloSize).toEqual(expected.outline.width);
    });

    it("returns a simple point symbol for type 'simple'", () => {
      const point = MinimalGeometriesUtils.getMinimalPoint(SRS);
      const testLayer = InternalDrawingLayer.FeatureHighlight;

      const result = service.createSymbolizationForDrawingLayer(point, testLayer) as SimpleMarkerSymbol;

      const expected = mockSymbolizations[testLayer].point as SimplePointSymbolization;
      expect(result.style).toEqual('circle');
      expect(result.color.toRgba()).toEqual([expected.color.r, expected.color.g, expected.color.b, expected.color.a]);
      expect(result.outline.color.toRgba()).toEqual([
        expected.outline.color.r,
        expected.outline.color.g,
        expected.outline.color.b,
        expected.outline.color.a,
      ]);
      expect(result.outline.width).toEqual(expected.outline.width);
    });

    it("returns a picture point symbol for type 'picture'", () => {
      const point = MinimalGeometriesUtils.getMinimalPoint(SRS);
      const testLayer = InternalDrawingLayer.LocatePosition;

      const result = service.createSymbolizationForDrawingLayer(point, testLayer) as PictureMarkerSymbol;

      const expected = mockSymbolizations[testLayer].point as PicturePointSymbolization;
      expect(result.url).toEqual(mockIconUrl);
      expect(result.url).toEqual(expected.url);
      expect(result.width).toEqual(expected.width);
      expect(result.height).toEqual(expected.height);
      expect(result.yoffset).toEqual(expected.yOffset);
      expect(result.xoffset).toEqual(expected.xOffset);
      expect(result.angle).toEqual(expected.angle);
    });
  });

  describe('line symbol type', () => {
    it('returns a line symbol', () => {
      const point = MinimalGeometriesUtils.getMinimalLineString(SRS);
      const testLayer = InternalDrawingLayer.FeatureHighlight;

      const result = service.createSymbolizationForDrawingLayer(point, testLayer) as SimpleLineSymbol;

      const expected = mockSymbolizations[testLayer].line;
      expect(result.style).toEqual('solid');
      expect(result.width).toEqual(expected.width);
      expect(result.color.toRgba()).toEqual([expected.color.r, expected.color.g, expected.color.b, expected.color.a]);
    });
  });

  describe('polygon symbol type', () => {
    it('returns a polygon symbol', () => {
      const point = MinimalGeometriesUtils.getMinimalPolygon(SRS);
      const testLayer = InternalDrawingLayer.FeatureHighlight;

      const result = service.createSymbolizationForDrawingLayer(point, testLayer) as SimpleFillSymbol;

      const expected = mockSymbolizations[testLayer].polygon;
      expect(result.style).toEqual('solid');
      expect(result.color.toRgba()).toEqual([expected.fill.color.r, expected.fill.color.g, expected.fill.color.b, expected.fill.color.a]);
      expect(result.outline.color.toRgba()).toEqual([
        expected.outline.color.r,
        expected.outline.color.g,
        expected.outline.color.b,
        expected.outline.color.a,
      ]);
      expect(result.outline.width).toEqual(expected.outline.width);
    });
  });
});
