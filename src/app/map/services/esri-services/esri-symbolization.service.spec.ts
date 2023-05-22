import {TestBed} from '@angular/core/testing';

import {EsriSymbolizationService} from './esri-symbolization.service';
import {MinimalGeometriesUtils} from '../../../testing/map-testing/minimal-geometries.utils';
import {SupportedSrs} from '../../../shared/types/supported-srs';
import {DrawingLayer} from '../../../shared/enums/drawing-layer.enum';
import SimpleLineSymbol from '@arcgis/core/symbols/SimpleLineSymbol';
import SimpleMarkerSymbol from '@arcgis/core/symbols/SimpleMarkerSymbol';
import SimpleFillSymbol from '@arcgis/core/symbols/SimpleFillSymbol';
import {GeometryCollectionWithSrs} from '../../../shared/interfaces/geojson-types-with-srs.interface';
import {ConfigService} from '../../../shared/services/config.service';
import {
  LayerSymbolizations,
  LineSymbolization,
  PolygonSymbolization,
  SimplePointSymbolization,
  SvgPointSymbolization
} from '../../../shared/interfaces/symbolization.interface';

const SRS: SupportedSrs = 2056;
const minimalTestSet = [
  {
    expected: 'SimpleLineSymbol',
    expectedInstanceOf: SimpleLineSymbol,
    geometry: MinimalGeometriesUtils.getMinimalLineString(SRS),
    type: 'LineString'
  },
  {
    expected: 'SimpleLineSymbol',
    expectedInstanceOf: SimpleLineSymbol,
    geometry: MinimalGeometriesUtils.getMinimalMultiLineString(SRS),
    type: 'MultiLineString'
  },
  {
    expected: 'SimpleMarkerSymbol',
    expectedInstanceOf: SimpleMarkerSymbol,
    geometry: MinimalGeometriesUtils.getMinimalPoint(SRS),
    type: 'Point'
  },
  {
    expected: 'SimpleMarkerSymbol',
    expectedInstanceOf: SimpleMarkerSymbol,
    geometry: MinimalGeometriesUtils.getMinimalMultiPoint(SRS),
    type: 'MultiPoint'
  },
  {
    expected: 'SimpleFillSymbol',
    expectedInstanceOf: SimpleFillSymbol,
    geometry: MinimalGeometriesUtils.getMinimalPolygon(SRS),
    type: 'Polygon'
  },
  {
    expected: 'SimpleFillSymbol',
    expectedInstanceOf: SimpleFillSymbol,
    geometry: MinimalGeometriesUtils.getMinimalMultiPolygon(SRS),
    type: 'MultiPolygon'
  }
];

// we only mock some of the values; because we mainly need to test different colors and point types.
const mockSymbolizations: LayerSymbolizations = {
  [DrawingLayer.LocatePosition]: {
    point: {
      type: 'svg',
      size: 24,
      color: {
        r: 0,
        g: 158,
        b: 224,
        a: 0.6
      },
      path: 'svgPath',
      yOffset: 12, // half of the image size to set needle at the actual point location
      xOffset: 0,
      angle: 0
    }
  },
  [DrawingLayer.FeatureHighlight]: {
    point: {
      type: 'simple',
      size: 12,
      color: {
        r: 255,
        g: 255,
        b: 0,
        a: 0.6
      },
      outline: {
        width: 1232,
        color: {
          r: 22,
          g: 12,
          b: 99,
          a: 0.11
        }
      }
    },
    line: {
      width: 5,
      color: {
        r: 255,
        g: 169,
        b: 0,
        a: 0.6
      }
    },
    polygon: {
      fill: {
        color: {
          r: 255,
          g: 255,
          b: 0,
          a: 0.6
        }
      },
      outline: {
        width: 5,
        color: {
          r: 164,
          g: 255,
          b: 0,
          a: 1.0
        }
      }
    }
  }
} as LayerSymbolizations;

describe('EsriSymbolizationService', () => {
  let service: EsriSymbolizationService;

  beforeEach(() => {
    // simple mock by overriding a readonly property and then injecting it into the TestBed.
    let configService = new ConfigService(document);
    configService = Object.assign(configService, {layerSymbolizations: mockSymbolizations});
    TestBed.configureTestingModule({
      providers: [EsriSymbolizationService, {provide: ConfigService, useValue: configService}]
    });
    service = TestBed.get(EsriSymbolizationService);
  });

  describe('geometry-dependent symbolization', () => {
    minimalTestSet.forEach(({expected, expectedInstanceOf, geometry, type}) => {
      it(`returns ${expected} for ${type}`, () => {
        const result = service.createSymbolizationForDrawingLayer(geometry, DrawingLayer.FeatureHighlight);

        expect(result).toBeInstanceOf(expectedInstanceOf);
      });
    });

    it('throws for GeometryCollection', () => {
      const collection: GeometryCollectionWithSrs = {type: 'GeometryCollection', geometries: [], srs: SRS};

      expect(() => service.createSymbolizationForDrawingLayer(collection, DrawingLayer.FeatureHighlight)).toThrow();
    });
  });

  describe('point symbol types', () => {
    it("returns a simple point symbol for type 'simple'", () => {
      const point = MinimalGeometriesUtils.getMinimalPoint(SRS);
      const testLayer = DrawingLayer.FeatureHighlight;

      const result = service.createSymbolizationForDrawingLayer(point, testLayer) as SimpleMarkerSymbol;

      const expected = mockSymbolizations[testLayer].point as SimplePointSymbolization;
      expect(result.style).toEqual('circle');
      expect(result.color.toRgba()).toEqual([expected.color.r, expected.color.g, expected.color.b, expected.color.a]);
      expect(result.outline.color.toRgba()).toEqual([
        expected.outline.color.r,
        expected.outline.color.g,
        expected.outline.color.b,
        expected.outline.color.a
      ]);
      expect(result.outline.width).toEqual(expected.outline.width);
    });

    it("returns an svg point symbol for type 'svg'", () => {
      const point = MinimalGeometriesUtils.getMinimalPoint(SRS);
      const testLayer = DrawingLayer.LocatePosition;

      const result = service.createSymbolizationForDrawingLayer(point, testLayer) as SimpleMarkerSymbol;

      const expected = mockSymbolizations[testLayer].point as SvgPointSymbolization;
      expect(result.style).toEqual('path');
      expect(result.path).toEqual(expected.path);
      expect(result.yoffset).toEqual(expected.yOffset);
      expect(result.xoffset).toEqual(expected.xOffset);
      expect(result.angle).toEqual(expected.angle);
      expect(result.color.toRgba()).toEqual([expected.color.r, expected.color.g, expected.color.b, expected.color.a]);
    });
  });

  describe('line symbol type', () => {
    it('returns a line symbol', () => {
      const point = MinimalGeometriesUtils.getMinimalLineString(SRS);
      const testLayer = DrawingLayer.FeatureHighlight;

      const result = service.createSymbolizationForDrawingLayer(point, testLayer) as SimpleLineSymbol;

      const expected = mockSymbolizations[testLayer].line as LineSymbolization;
      expect(result.style).toEqual('solid');
      expect(result.width).toEqual(expected.width);
      expect(result.color.toRgba()).toEqual([expected.color.r, expected.color.g, expected.color.b, expected.color.a]);
    });
  });

  describe('polygon symbol type', () => {
    it('returns a polygon symbol', () => {
      const point = MinimalGeometriesUtils.getMinimalPolygon(SRS);
      const testLayer = DrawingLayer.FeatureHighlight;

      const result = service.createSymbolizationForDrawingLayer(point, testLayer) as SimpleFillSymbol;

      const expected = mockSymbolizations[testLayer].polygon as PolygonSymbolization;
      expect(result.style).toEqual('solid');
      expect(result.color.toRgba()).toEqual([expected.fill.color.r, expected.fill.color.g, expected.fill.color.b, expected.fill.color.a]);
      expect(result.outline.color.toRgba()).toEqual([
        expected.outline.color.r,
        expected.outline.color.g,
        expected.outline.color.b,
        expected.outline.color.a
      ]);
      expect(result.outline.width).toEqual(expected.outline.width);
    });
  });
});
